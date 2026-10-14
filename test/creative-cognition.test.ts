import { describe, it, expect } from 'vitest';
import {
  evaluateVisualSaliency,
  evaluateCognitiveEntropy,
  evaluateThumbZoneErgonomics,
  auditCvdDualEncoding,
} from '../src/creative-cognition';

describe('Creative Cognition: Visual Saliency & CTA Dominance', () => {
  it('detects when a peripheral distractor overpowers the primary CTA', () => {
    const targets = [
      { id: 'cta', text: 'Register Now', isPrimaryCta: true, widthPx: 120, heightPx: 44, centerXPx: 200, centerYPx: 500, absLc: 65, fontWeight: 500 },
      { id: 'distractor', text: 'FLASHY COORDINATE BADGE', isPrimaryCta: false, widthPx: 280, heightPx: 60, centerXPx: 200, centerYPx: 200, absLc: 95, fontWeight: 700 },
    ];
    const res = evaluateVisualSaliency(targets);
    expect(res.passes).toBe(false);
    expect(res.violations.some(v => v.includes('is visually overpowered by peripheral element'))).toBe(true);
  });

  it('passes when primary CTA has commanding visual presence', () => {
    const targets = [
      { id: 'cta', text: 'Continue to Step 2', isPrimaryCta: true, widthPx: 240, heightPx: 48, centerXPx: 200, centerYPx: 500, absLc: 95, fontWeight: 700 },
      { id: 'cancel', text: 'Back', isPrimaryCta: false, widthPx: 80, heightPx: 36, centerXPx: 80, centerYPx: 500, absLc: 60, fontWeight: 500 },
    ];
    const res = evaluateVisualSaliency(targets);
    expect(res.passes).toBe(true);
    expect(res.ctaDominanceIndex).toBeGreaterThan(1.25);
  });
});

describe('Creative Cognition: Cognitive Load & Visual Shannon Entropy', () => {
  it('flags cognitive overload when UI is stuffed with clashing fonts and corner radiuses', () => {
    const noisySpec = {
      viewportWidthPx: 1280,
      viewportHeightPx: 900,
      distinctColorCount: 14,
      distinctFontCount: 4,
      distinctBorderRadiiCount: 6,
      elementCount: 160,
    };
    const res = evaluateCognitiveEntropy(noisySpec);
    expect(res.passes).toBe(false);
    expect(res.cognitiveLoadGrade).toBe('Cognitive-Overload');
  });

  it('classifies disciplined Swiss layout as Tranquil-Silk', () => {
    const calmSpec = {
      viewportWidthPx: 1280,
      viewportHeightPx: 900,
      distinctColorCount: 4,
      distinctFontCount: 1, // Single sans
      distinctBorderRadiiCount: 2, // Standard squircles
      elementCount: 45,
    };
    const res = evaluateCognitiveEntropy(calmSpec);
    expect(res.passes).toBe(true);
    expect(res.cognitiveLoadGrade).toBe('Tranquil-Silk');
  });
});

describe('Creative Cognition: Mobile Thumb Reachability Polar Coordinates', () => {
  it('flags primary action in the mobile Pain Zone (top-left on phone)', () => {
    const res = evaluateThumbZoneErgonomics({
      id: 'btn-next',
      name: 'Continue',
      centerXPx: 50, // Left edge
      centerYPx: 80, // Top bar
      isPrimaryAction: true,
      viewportWidthPx: 390,
      viewportHeightPx: 844,
    });
    expect(res.passes).toBe(false);
    expect(res.primaryZone).toBe('Pain-Zone-Two-Hand');
    expect(res.violations.some(v => v.includes('Mobile Pain Zone'))).toBe(true);
  });

  it('passes primary action in the Natural Sweep Zone at the bottom', () => {
    const res = evaluateThumbZoneErgonomics({
      id: 'btn-next',
      name: 'Continue',
      centerXPx: 200,
      centerYPx: 800, // Bottom dock
      isPrimaryAction: true,
      viewportWidthPx: 390,
      viewportHeightPx: 844,
    });
    expect(res.passes).toBe(true);
    expect(res.primaryZone).toBe('Natural-Sweep');
  });
});

describe('Creative Cognition: CVD Dual-Encoding Verification', () => {
  it('rejects states indicated solely by color', () => {
    const res = auditCvdDualEncoding([
      { id: 'status-pill', state: 'error', colorOnly: true, hasIconIndicator: false, hasTextLabel: false },
    ]);
    expect(res.passes).toBe(false);
    expect(res.violations.some(v => v.includes('relies exclusively on color'))).toBe(true);
  });
});
