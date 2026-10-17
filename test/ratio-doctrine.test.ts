import { describe, it, expect } from 'vitest';
import {
  computeNonUniformDynamicScale,
  auditOpticalStemThickness,
  auditPsychophysicalRatios,
  auditConcentricCornerRadius,
  auditFocusRingRatio,
  auditHarmonicAspectRatio,
  auditChromostereopsisHazard,
  PSYCHOPHYSICAL_RATIOS,
} from '../src/ratio-doctrine.js';

describe('Pure-Ratio Psychophysical Doctrine Engine', () => {
  describe('1. Non-Uniform Dynamic Type Power Law Scaling', () => {
    it('scales headings sub-linearly and body/captions super-linearly', () => {
      const scaleFactor = 1.6; // Large accessibility bump

      // Display heading: exponent 0.65 -> compresses expansion to prevent layout rupture
      const display = computeNonUniformDynamicScale({
        baseFontSizePx: 34,
        scaleFactor,
        role: 'display',
      });
      // 1.6 ^ 0.65 = ~1.358 -> 34 * 1.358 = ~46.2px (NOT 34 * 1.6 = 54.4px!)
      expect(display.scaledFontSizePx).toBeLessThan(34 * scaleFactor);
      expect(display.scaledFontSizePx).toBe(46.1);

      // Body: exponent 1.05 -> slightly expansive
      const body = computeNonUniformDynamicScale({
        baseFontSizePx: 17,
        scaleFactor,
        role: 'body',
      });
      expect(body.scaledFontSizePx).toBe(27.8);

      // Caption: exponent 1.22 -> super-linear expansion to protect low-vision readers
      const caption = computeNonUniformDynamicScale({
        baseFontSizePx: 12,
        scaleFactor,
        role: 'caption',
      });
      // 1.6 ^ 1.22 = ~1.774 -> 12 * 1.774 = ~21.3px
      expect(caption.scaledFontSizePx).toBeGreaterThan(12 * scaleFactor);
      expect(caption.scaledFontSizePx).toBe(21.3);
    });
  });

  describe('2. Optical Stem Thickness & Stroke Vibration Audit', () => {
    it('detects subpixel diffraction hazard when micro-text has anemic stem width', () => {
      // 10px text @ weight 400 has stem width ~1.04px (< 1.25px threshold)
      const res = auditOpticalStemThickness({
        fontSizePx: 10,
        fontWeight: 400,
      });

      expect(res.passes).toBe(false);
      expect(res.hasSubpixelDiffractionHazard).toBe(true);
      expect(res.estimatedStemWidthPx).toBeLessThan(PSYCHOPHYSICAL_RATIOS.OPTICAL_STEM_FLOOR_PX);
      expect(res.violation).toContain('optical threshold');
    });

    it('passes micro-text when font-weight is elevated to Medium/SemiBold to anchor stem width', () => {
      // 12px text @ weight 700 has stem width ~2.06px (>= 1.25px threshold)
      const res = auditOpticalStemThickness({
        fontSizePx: 12,
        fontWeight: 700,
      });

      expect(res.passes).toBe(true);
      expect(res.hasSubpixelDiffractionHazard).toBe(false);
      expect(res.estimatedStemWidthPx).toBeGreaterThanOrEqual(PSYCHOPHYSICAL_RATIOS.OPTICAL_STEM_FLOOR_PX);
    });
  });

  describe('3. Multi-Scale Psychophysical Ratios Audit', () => {
    it('flags violations when layout fails Gestalt proximity, heading clinging, and grey ghosting contrast', () => {
      const flawedLayout = {
        viewportWidthPx: 390,
        viewportHeightPx: 844,
        canvasMarginHorizontalPx: 10, // 10 / 390 = 2.5% (< 4% floor!)
        contentWidthPx: 370,

        interContainerGutterPx: 8,
        intraContainerPaddingPx: 20, // 8 / 20 = 0.40 (< 0.75 floor!)

        labelToInputGapPx: 12,
        inputToNextGroupGapPx: 10, // Proximity ratio: 10 / 12 = 0.83 (< 1.50!)

        headingMarginTopPx: 4,
        headingMarginBottomPx: 12, // Clinging ratio: 4 / 12 = 0.33 (< 2.00!)

        fontSizePx: 10,
        fontWeight: 400,
        lineHeightPx: 12, // 12 / 10 = 1.20 (< 1.45 floor for body!)
        colorHex: '#9BA7B8', // Lc 50.7 against white (< Lc 70 floor for micro!)
        bgHex: '#FFFFFF',
        role: 'micro' as const,

        touchHitDimensionPx: 28, // Below 44px floor!
        visualGlyphDimensionPx: 14,
      };

      const result = auditPsychophysicalRatios(flawedLayout);
      expect(result.passes).toBe(false);
      expect(result.score).toBeLessThan(50);

      // Verify specific ratio diagnoses
      expect(result.violations.some((v) => v.includes('Canvas margin ratio'))).toBe(true);
      expect(result.violations.some((v) => v.includes('Inter-container gutter to intra-padding ratio'))).toBe(true);
      expect(result.violations.some((v) => v.includes('Gestalt proximity ratio'))).toBe(true);
      expect(result.violations.some((v) => v.includes('Heading clinging ratio'))).toBe(true);
      expect(result.violations.some((v) => v.includes('Washed-out grey ghosting'))).toBe(true);
      expect(result.violations.some((v) => v.includes('Touch hit target'))).toBe(true);
      expect(result.violations.some((v) => v.includes('optical threshold'))).toBe(true);
    });

    it('passes with perfect score when layout honors all psychophysical harmonic ratios', () => {
      const harmoniousLayout = {
        viewportWidthPx: 1280,
        viewportHeightPx: 900,
        canvasMarginHorizontalPx: 64, // 64 / 1280 = 5.0% (>= 4%)
        contentWidthPx: 680, // Generous whitespace

        interContainerGutterPx: 16,
        intraContainerPaddingPx: 18, // 16 / 18 = 0.89 (>= 0.75)

        labelToInputGapPx: 6,
        inputToNextGroupGapPx: 18, // Proximity ratio: 18 / 6 = 3.0 (>= 1.5)

        headingMarginTopPx: 24,
        headingMarginBottomPx: 8, // Clinging ratio: 24 / 8 = 3.0 (>= 2.0)

        fontSizePx: 15,
        fontWeight: 500,
        lineHeightPx: 24, // 24 / 15 = 1.60 (Body in 1.45 - 1.68)
        colorHex: '#0F172A', // Slate-900: Lc ~100
        bgHex: '#FFFFFF',
        role: 'body' as const,

        touchHitDimensionPx: 48, // Generous touch target
        visualGlyphDimensionPx: 18,
      };

      const result = auditPsychophysicalRatios(harmoniousLayout);
      expect(result.passes).toBe(true);
      expect(result.score).toBe(100);
      expect(result.violations).toHaveLength(0);
      expect(result.ratios.gestaltProximityRatio).toBe(3);
      expect(result.ratios.headingClingingRatio).toBe(3);
    });

    it('detects Gestalt enclosure violation when container padding is smaller than child gap', () => {
      const enclosureViolation = {
        viewportWidthPx: 1280,
        viewportHeightPx: 900,
        canvasMarginHorizontalPx: 48,
        contentWidthPx: 800,
        interContainerGutterPx: 24,
        intraContainerPaddingPx: 12,
        childGapPx: 20, // 12px padding < 20px child gap!
        fontSizePx: 16,
        fontWeight: 400,
        role: 'body' as const,
      };

      const result = auditPsychophysicalRatios(enclosureViolation);
      expect(result.passes).toBe(false);
      expect(result.ratios.gestaltEnclosureRatio).toBe(0.6);
      expect(result.violations.some((v) => v.includes('Gestalt enclosure ratio (0.60) is below 1.00'))).toBe(true);
    });

    it('detects squeezed micro-tracking and over-spaced display headline tracking', () => {
      const squeezedMicro = auditPsychophysicalRatios({
        viewportWidthPx: 390,
        viewportHeightPx: 844,
        canvasMarginHorizontalPx: 24,
        contentWidthPx: 340,
        interContainerGutterPx: 16,
        intraContainerPaddingPx: 20,
        fontSizePx: 12,
        fontWeight: 500,
        letterSpacingEm: -0.01, // < 0.02 floor!
        role: 'micro' as const,
      });

      expect(squeezedMicro.violations.some((v) => v.includes('tracking (-0.01em) is squeezed'))).toBe(true);

      const looseDisplay = auditPsychophysicalRatios({
        viewportWidthPx: 1280,
        viewportHeightPx: 900,
        canvasMarginHorizontalPx: 64,
        contentWidthPx: 800,
        interContainerGutterPx: 24,
        intraContainerPaddingPx: 24,
        fontSizePx: 36,
        fontWeight: 700,
        letterSpacingEm: 0.05, // > 0.005 max!
        role: 'display' as const,
      });

      expect(looseDisplay.violations.some((v) => v.includes('Display heading tracking (0.05em) is over-spaced'))).toBe(true);
    });

    it('detects peripheral tension when outer margin is tighter than inter-card gutter', () => {
      const invertedMargins = auditPsychophysicalRatios({
        viewportWidthPx: 1280,
        viewportHeightPx: 900,
        canvasMarginHorizontalPx: 16, // 16px < 32px gutter!
        contentWidthPx: 1000,
        interContainerGutterPx: 32,
        intraContainerPaddingPx: 24,
        fontSizePx: 16,
        fontWeight: 400,
        role: 'body' as const,
      });

      expect(invertedMargins.violations.some((v) => v.includes('Canvas horizontal margin (16px) is smaller than inter-container gutter'))).toBe(true);
    });
  });

  describe('4. Concentric Corner Radius Canon', () => {
    it('detects optical buckling when inner radius fails R_inner = max(0, R_outer - padding)', () => {
      // Outer radius 16px, padding 12px -> Ideal inner radius is 4px.
      // If inner radius is 12px, it violates concentric curvature.
      const res = auditConcentricCornerRadius({
        outerRadiusPx: 16,
        innerRadiusPx: 12,
        paddingPx: 12,
      });

      expect(res.passes).toBe(false);
      expect(res.idealInnerRadiusPx).toBe(4);
      expect(res.deltaPx).toBe(8);
      expect(res.violation).toContain('Concentric corner radius mismatch');
    });

    it('passes when inner radius is concentric with outer radius within tolerance', () => {
      const res = auditConcentricCornerRadius({
        outerRadiusPx: 20,
        innerRadiusPx: 8,
        paddingPx: 12,
      });

      expect(res.passes).toBe(true);
      expect(res.idealInnerRadiusPx).toBe(8);
      expect(res.deltaPx).toBe(0);
      expect(res.violation).toBeUndefined();
    });
  });

  describe('5. Focus Ring Geometry & Thickness Ratio', () => {
    it('rejects thin or zero-gap focus rings that collide with element borders', () => {
      const res = auditFocusRingRatio({
        focusRingStrokePx: 1.0, // < 2.0px floor
        focusOffsetGapPx: 0, // < 2.0px gap floor
        elementBorderPx: 1.0,
      });

      expect(res.passes).toBe(false);
      expect(res.violation).toContain('visibility threshold');
      expect(res.violation).toContain('occlude');
    });

    it('approves generous, un-occluded focus ring geometry', () => {
      const res = auditFocusRingRatio({
        focusRingStrokePx: 2.5,
        focusOffsetGapPx: 2.0,
        elementBorderPx: 1.0,
      });

      expect(res.passes).toBe(true);
      expect(res.strokeRatio).toBe(2.5);
      expect(res.violation).toBeUndefined();
    });
  });

  describe('6. Canonical Harmonic Aspect Ratio Canon', () => {
    it('identifies canonical Swiss, Golden, and photographic aspect ratios', () => {
      // 16:9 widescreen card (1920x1080 -> 1.778)
      const res16_9 = auditHarmonicAspectRatio({ widthPx: 1920, heightPx: 1080 });
      expect(res16_9.passes).toBe(true);
      expect(res16_9.nearestCanonicalName).toBe('WIDESCREEN_16_9');

      // Golden ratio card (809x500 -> 1.618)
      const resGolden = auditHarmonicAspectRatio({ widthPx: 809, heightPx: 500 });
      expect(resGolden.passes).toBe(true);
      expect(resGolden.nearestCanonicalName).toBe('GOLDEN_RATIO');

      // Random awkward dimension (700x310 -> 2.258)
      const resAwkward = auditHarmonicAspectRatio({ widthPx: 700, heightPx: 310 });
      expect(resAwkward.passes).toBe(false);
      expect(resAwkward.recommendation).toContain('deviates from canonical');
    });
  });

  describe('7. Chromostereopsis Retinal Aberration Hazard', () => {
    it('detects severe optical aberration hazard between saturated red and pure blue/cyan', () => {
      const hazard = auditChromostereopsisHazard('#FF0033', '#0044FF');
      expect(hazard.hasHazard).toBe(true);
      expect(hazard.violation).toContain('chromostereopsis');
    });

    it('passes harmonious low-dispersion color pairings', () => {
      const ok = auditChromostereopsisHazard('#0F172A', '#38BDF8');
      expect(ok.hasHazard).toBe(false);
      expect(ok.violation).toBeUndefined();
    });
  });
});

