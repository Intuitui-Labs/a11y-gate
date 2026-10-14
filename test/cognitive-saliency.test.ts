import { describe, it, expect } from 'vitest';
import {
  evaluateVisualSaliency,
  evaluateVisualEntropy,
  evaluateThumbZoneErgonomics,
  type SaliencyElementSpec,
  type VisualEntropyConfig,
  type ThumbZoneConfig,
} from '../src/cognitive-saliency';

describe('Visionary Cognitive Perception: Saccadic Saliency & Attention Ratio', () => {
  it('rejects interfaces where decorative technical noise hijacks visual attention from primary CTA', () => {
    const elements: SaliencyElementSpec[] = [
      {
        id: 'primary-continue-btn',
        role: 'primary-action',
        widthPx: 140,
        heightPx: 44,
        fontWeight: 500,
        absLc: 65,
        viewportYPx: 700,
      },
      {
        id: 'huge-glowing-coordinate-hud',
        role: 'decorative',
        widthPx: 300,
        heightPx: 120, // huge decorative HUD element
        fontWeight: 700,
        absLc: 95, // very bright
        viewportYPx: 200,
      },
    ];

    const result = evaluateVisualSaliency(elements);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('Visual Attention Hijack'))).toBe(true);
    expect(result.attentionRatio).toBeLessThan(1.3);
  });

  it('passes when primary action has commanding visual salience over subtle decorative wash', () => {
    const elements: SaliencyElementSpec[] = [
      {
        id: 'primary-continue-btn',
        role: 'primary-action',
        widthPx: 180,
        heightPx: 48,
        fontWeight: 600,
        absLc: 90,
        viewportYPx: 750,
      },
      {
        id: 'subtle-ambient-glow',
        role: 'decorative',
        widthPx: 80,
        heightPx: 20,
        fontWeight: 400,
        absLc: 40, // very soft
        viewportYPx: 100,
      },
    ];

    const result = evaluateVisualSaliency(elements);
    expect(result.passes).toBe(true);
    expect(result.attentionRatio).toBeGreaterThan(1.5);
  });
});

describe('Visionary Cognitive Perception: Visual Shannon Entropy', () => {
  it('detects high visual entropy (sensory overload) from AI token chaos', () => {
    const chaoticConfig: VisualEntropyConfig = {
      uniqueFontSizes: [10, 11, 12, 13, 15, 17, 21, 24, 28, 36], // 10 fragmented sizes
      uniqueFontWeights: [200, 300, 400, 500, 600, 700, 800], // 7 weights
      uniqueColors: ['#000', '#222', '#555', '#777', '#888', '#aaa', '#ccc', '#d4af37', '#2563eb', '#ef4444'],
      uniqueBorderStyles: ['1px solid #333', '1px dashed #444', '2px solid #555', '0.5px solid #666'],
    };

    const result = evaluateVisualEntropy(chaoticConfig);
    expect(result.passes).toBe(false);
    expect(result.entropyBits).toBeGreaterThan(4.0);
    expect(result.violations.some(v => v.includes('Visual Shannon Entropy is excessive'))).toBe(true);
  });

  it('passes tranquil silk layout with disciplined modular tokens', () => {
    const silkConfig: VisualEntropyConfig = {
      uniqueFontSizes: [13, 16, 20, 25], // 4 modular steps
      uniqueFontWeights: [400, 600], // 2 disciplined weights
      uniqueColors: ['#F1F5F9', '#CBD5E1', '#D4AF37'], // 3 harmonious tokens
      uniqueBorderStyles: ['1px solid rgba(255,255,255,0.08)'], // 1 soft boundary
    };

    const result = evaluateVisualEntropy(silkConfig);
    expect(result.passes).toBe(true);
    expect(result.clutterLevel).toBe('Tranquil / Silk');
  });
});

describe('Visionary Cognitive Perception: Polar Thumb-Zone Reachability', () => {
  it('rejects mobile primary action stranded in top Friction Zone', () => {
    const config: ThumbZoneConfig = {
      viewportWidthPx: 390,
      viewportHeightPx: 844,
      handedness: 'right',
      touchPoints: [
        {
          id: 'continue-btn',
          role: 'primary-action',
          xPx: 195,
          yPx: 120, // stranded at the top!
        },
      ],
    };

    const result = evaluateThumbZoneErgonomics(config);
    expect(result.passes).toBe(false);
    expect(result.primaryActionZone).toBe('Friction');
    expect(result.violations.some(v => v.includes('outside Natural Thumb Zone'))).toBe(true);
  });

  it('passes when primary action is docked in bottom Natural Thumb Zone', () => {
    const config: ThumbZoneConfig = {
      viewportWidthPx: 390,
      viewportHeightPx: 844,
      handedness: 'right',
      touchPoints: [
        {
          id: 'continue-btn',
          role: 'primary-action',
          xPx: 300,
          yPx: 790, // docked right in the comfortable thumb arc!
        },
      ],
    };

    const result = evaluateThumbZoneErgonomics(config);
    expect(result.passes).toBe(true);
    expect(result.primaryActionZone).toBe('Natural');
  });
});
