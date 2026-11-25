import { describe, it, expect } from 'vitest';
import {
  computeProportionalTracking,
  computeProportionalLeading,
  computeProportionalWordSpacing,
  computeProportionalContainerSpacing,
  auditProportionalSpacing,
  auditMultiStandardBaseline,
  auditComprehensiveA11yGate,
  generateModularTypographicScale,
  auditTypographicRole,
} from '../src/index.js';

describe('Proportional Typographic & Spatial Scaling Engine', () => {
  describe('1. Continuous Optical Tracking Scaling Curve', () => {
    it('scales tracking inversely with font size: open for microcopy, tight for display', () => {
      const micro = computeProportionalTracking(10);
      expect(micro.idealEm).toBe(0.04);
      expect(micro.minEm).toBeGreaterThanOrEqual(0.02);

      const body = computeProportionalTracking(16);
      expect(body.idealEm).toBe(0.005);
      expect(body.minEm).toBeLessThanOrEqual(0);

      const headline = computeProportionalTracking(32);
      expect(headline.idealEm).toBe(-0.015);
      expect(headline.idealEm).toBeLessThan(0);

      const display = computeProportionalTracking(64);
      expect(display.idealEm).toBe(-0.022);
      expect(display.idealEm).toBeLessThan(headline.idealEm);
    });
  });

  describe('2. Continuous Optical Leading Curve', () => {
    it('scales leading proportionally: spacious for body/micro, compact for headlines', () => {
      const micro = computeProportionalLeading(11, 'micro');
      expect(micro.idealRatio).toBe(1.62);

      const body = computeProportionalLeading(16, 'body');
      expect(body.idealRatio).toBe(1.52);

      const headline = computeProportionalLeading(32, 'headline');
      expect(headline.idealRatio).toBe(1.22);

      const display = computeProportionalLeading(64, 'display');
      expect(display.idealRatio).toBe(1.10);
    });
  });

  describe('3. Word Spacing & Container Proportional Scaling', () => {
    it('calculates WCAG 1.4.12 proportional word spacing floor', () => {
      const word = computeProportionalWordSpacing(16);
      expect(word.minPx).toBe(2.6); // 16 * 0.16 = 2.56 -> 2.6
      expect(word.idealPx).toBe(4.0); // 16 * 0.25 = 4.0
    });

    it('tethers container padding and child gap to typographic scale', () => {
      const container = computeProportionalContainerSpacing(16);
      expect(container.minPaddingPx).toBeGreaterThanOrEqual(20);
      expect(container.idealPaddingPx).toBe(24);
      expect(container.maxChildGapPx).toBeLessThan(container.idealPaddingPx);
    });
  });

  describe('4. Hard Legal Baseline Failures', () => {
    it('triggers HARD BASELINE ERROR on sub-12px font size', () => {
      const res = auditProportionalSpacing({
        fontSizePx: 10,
        role: 'body',
      });

      expect(res.isHardBaselineFailure).toBe(true);
      expect(res.level).toBe('Fail');
      expect(res.hardBaselineViolations.some(v => v.includes('absolute legibility floor'))).toBe(true);
    });

    it('triggers HARD BASELINE ERROR on crushed body leading (< 1.30x)', () => {
      const res = auditProportionalSpacing({
        fontSizePx: 16,
        lineHeightPx: 18, // 18 / 16 = 1.125 < 1.30
        role: 'body',
      });

      expect(res.isHardBaselineFailure).toBe(true);
      expect(res.level).toBe('Fail');
      expect(res.hardBaselineViolations.some(v => v.includes('Crushed leading ratio'))).toBe(true);
    });

    it('triggers HARD BASELINE ERROR on negative tracking on small text (<= 14px)', () => {
      const res = auditProportionalSpacing({
        fontSizePx: 12,
        letterSpacingEm: -0.02,
        role: 'body',
      });

      expect(res.isHardBaselineFailure).toBe(true);
      expect(res.level).toBe('Fail');
      expect(res.hardBaselineViolations.some(v => v.includes('Negative letter-spacing'))).toBe(true);
    });

    it('triggers HARD BASELINE ERROR when word spacing is below WCAG 1.4.12 0.16x floor', () => {
      const res = auditProportionalSpacing({
        fontSizePx: 20,
        wordSpacingPx: 2.0, // 2.0 / 20 = 0.10 < 0.16
        role: 'body',
      });

      expect(res.isHardBaselineFailure).toBe(true);
      expect(res.level).toBe('Fail');
      expect(res.hardBaselineViolations.some(v => v.includes('Word spacing'))).toBe(true);
    });

    it('triggers HARD BASELINE ERROR on Gestalt container enclosure collapse (Padding < 0.85x Gap)', () => {
      const res = auditProportionalSpacing({
        fontSizePx: 16,
        containerPaddingPx: 8,
        childGapPx: 24, // 8 / 24 = 0.33 < 0.85
        role: 'body',
      });

      expect(res.isHardBaselineFailure).toBe(true);
      expect(res.level).toBe('Fail');
      expect(res.hardBaselineViolations.some(v => v.includes('Gestalt enclosure collapse'))).toBe(true);
    });
  });

  describe('5. Conformance Tiers (Gold, Silver, Bronze)', () => {
    it('certifies Gold Tier on optically perfect Swiss typography and spacing', () => {
      const goldSpec = {
        fontSizePx: 16,
        lineHeightPx: 24, // 1.50x (ideal is 1.52)
        letterSpacingEm: 0.005, // matches ideal
        wordSpacingPx: 4.0, // 0.25x
        containerPaddingPx: 24,
        childGapPx: 16, // Padding 24 > Gap 16
        readingMeasureChars: 60,
        role: 'body' as const,
      };

      const res = auditProportionalSpacing(goldSpec);
      expect(res.isHardBaselineFailure).toBe(false);
      expect(res.level).toBe('Gold');
      expect(res.score).toBeGreaterThanOrEqual(90);
      expect(res.hardBaselineViolations).toHaveLength(0);
    });

    it('certifies Silver Tier on standard acceptable spacing with minor variance', () => {
      const silverSpec = {
        fontSizePx: 16,
        lineHeightPx: 23, // 1.44x
        letterSpacingEm: 0.04, // slightly wide
        containerPaddingPx: 18,
        childGapPx: 16,
        role: 'body' as const,
      };

      const res = auditProportionalSpacing(silverSpec);
      expect(res.isHardBaselineFailure).toBe(false);
      expect(res.level).toBe('Silver');
      expect(res.score).toBeGreaterThanOrEqual(75);
    });

    it('certifies Bronze Tier on minimal baseline compliance', () => {
      const bronzeSpec = {
        fontSizePx: 16,
        lineHeightPx: 22, // 1.375x
        letterSpacingEm: -0.01,
        containerPaddingPx: 16,
        childGapPx: 18, // 16 / 18 = 0.89 >= 0.85
        role: 'body' as const,
      };

      const res = auditProportionalSpacing(bronzeSpec);
      expect(res.isHardBaselineFailure).toBe(false);
      expect(res.level).toBe('Bronze');
      expect(res.score).toBeGreaterThanOrEqual(60);
    });
  });

  describe('6. Integration with MultiStandardBaseline & Comprehensive Gate', () => {
    it('fails legal baseline in auditMultiStandardBaseline when hard spacing violation is present', () => {
      const multiReport = auditMultiStandardBaseline({
        name: 'Production Screen',
        colorPairs: [
          { id: 'body', fg: '#0F172A', bg: '#FFFFFF', role: 'body' },
        ],
        spacingSpecs: [
          // Hard failure: 10px text
          { id: 'micro', fontSizePx: 10, role: 'micro' },
        ],
      });

      expect(multiReport.passesAllStandards).toBe(false);
      expect(multiReport.baseline.passesLegalBaseline).toBe(false);
      expect(multiReport.spacing.spacingTier).toBe('Fail');
      expect(multiReport.compositeSummary.baselineGrade).toBe('Fail');
    });

    it('blocks CI gate in auditComprehensiveA11yGate on hard proportional spacing violation', () => {
      const gateReport = auditComprehensiveA11yGate({
        name: 'Broken Typographic Page',
        spacingSpecs: [
          // Hard failure: crushed body leading 1.1x
          { id: 'crushed-body', fontSizePx: 16, lineHeightPx: 17.6, role: 'body' },
        ],
      });

      expect(gateReport.passesGate).toBe(false);
      expect(gateReport.grade).toBe('Fail');
      expect(gateReport.spacingTier).toBe('Fail');
      expect(gateReport.subsystems.spacingPassed).toBe(false);
      expect(gateReport.errors.some(e => e.includes('Crushed leading ratio'))).toBe(true);
    });

    it('certifies Gold Gate when contrast, schema, and proportional spacing all reach Gold tier', () => {
      const goldGateReport = auditComprehensiveA11yGate({
        name: 'Swiss Silk Form',
        colorPairs: [
          { id: 'h1', fg: '#000000', bg: '#FFFFFF', role: 'headline' }, // Gold APCA
          { id: 'body', fg: '#000000', bg: '#FFFFFF', role: 'body' }, // Gold APCA
        ],
        spacingSpecs: [
          {
            id: 'body-text',
            fontSizePx: 16,
            lineHeightPx: 24,
            letterSpacingEm: 0.005,
            wordSpacingPx: 4.0,
            containerPaddingPx: 24,
            childGapPx: 16,
            readingMeasureChars: 60,
            role: 'body',
          },
        ],
      });

      expect(goldGateReport.passesGate).toBe(true);
      expect(goldGateReport.grade).toBe('AAA');
      expect(goldGateReport.spacingTier).toBe('Gold');
      expect(goldGateReport.subsystems.spacingPassed).toBe(true);
      expect(goldGateReport.errors).toHaveLength(0);
    });
  });

  describe('7. Canonical Typographic Roles & Modular Scale Generation', () => {
    it('generates a complete, mathematically coherent modular scale anchored to 16px base', () => {
      const scale = generateModularTypographicScale({
        basePx: 16,
        ratio: 'major-third', // 1.250
      });

      expect(scale.body.fontSizePx).toBe(16);
      expect(scale.caption.fontSizePx).toBeLessThan(scale.body.fontSizePx);
      expect(scale.caption.fontSizePx).toBeGreaterThanOrEqual(12);
      expect(scale.micro.fontSizePx).toBeGreaterThanOrEqual(11);

      expect(scale.subhead.fontSizePx).toBe(20); // 16 * 1.25 = 20
      expect(scale.h3.fontSizePx).toBe(25);      // 16 * 1.25^2 = 25
      expect(scale.h2.fontSizePx).toBe(31);      // 16 * 1.25^3 = 31.25 -> 31
      expect(scale.h1.fontSizePx).toBe(39);      // 16 * 1.25^4 = 39.06 -> 39
      expect(scale.display.fontSizePx).toBe(49); // 16 * 1.25^5 = 48.8 -> 49

      // Verify optical tracking curve is properly bound:
      expect(scale.micro.letterSpacingEm).toBeGreaterThan(0);
      expect(scale.display.letterSpacingEm).toBeLessThan(0);

      // Verify leading ratio decreases as font size increases:
      expect(scale.caption.leadingRatio).toBeGreaterThan(scale.display.leadingRatio);
    });

    it('enforces mobile 16px floor on body text to prevent iOS Safari auto-zoom', () => {
      const desktopAudit = auditTypographicRole('body', 14, false);
      expect(desktopAudit.passes).toBe(true);

      const mobileAudit = auditTypographicRole('body', 14, true);
      expect(mobileAudit.passes).toBe(false);
      expect(mobileAudit.isHardFailure).toBe(true);
      expect(mobileAudit.violations.some(v => v.includes('iOS Safari'))).toBe(true);
    });

    it('triggers hard error if font size is below role legibility floor', () => {
      const microAudit = auditTypographicRole('micro', 9);
      expect(microAudit.isHardFailure).toBe(true);
      expect(microAudit.violations.some(v => v.includes('below its physical legibility floor'))).toBe(true);
    });
  });
});
