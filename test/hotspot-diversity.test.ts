import { describe, it, expect } from 'vitest';
import {
  auditAffordanceDiversity,
  auditHotspotDispersion,
  auditAdaptiveDensity,
} from '../src/hotspot-diversity.js';

describe('Hotspot Dynamics, Affordance Diversity & Adaptive Density Engine', () => {
  describe('1. Affordance Diversity Quotient (ADQ)', () => {
    it('detects repetition suppression hazard when a step is filled with monotonous single-line text inputs', () => {
      // Step with 6 identical text inputs: ADQ = 1 / 6 = 0.17 (< 0.35 floor!)
      const monotonousStep = auditAffordanceDiversity({
        stepId: 'monotonous-onboarding',
        fieldModalities: [
          'text-typing',
          'text-typing',
          'text-typing',
          'text-typing',
          'text-typing',
          'text-typing',
        ],
      });

      expect(monotonousStep.passes).toBe(false);
      expect(monotonousStep.hasRepetitionSuppressionHazard).toBe(true);
      expect(monotonousStep.adq).toBe(0.17);
      expect(monotonousStep.violation).toContain('repetition suppression');
      expect(monotonousStep.recommendation).toContain('tap-pills');
    });

    it('passes with high score when step interweaves diverse interactive modalities', () => {
      // Step with 5 fields across 4 distinct modalities: ADQ = 4 / 5 = 0.80 (>= 0.35)
      const dynamicStep = auditAffordanceDiversity({
        stepId: 'rich-profile-step',
        fieldModalities: [
          'text-typing', // Full Name
          'picker-search', // Address search
          'tap-pill', // Employment Status
          'date-preset', // Start Date
          'dual-column', // Compensation
        ],
      });

      expect(dynamicStep.passes).toBe(true);
      expect(dynamicStep.hasRepetitionSuppressionHazard).toBe(false);
      expect(dynamicStep.adq).toBe(1.0);
      expect(dynamicStep.uniqueModalities).toHaveLength(5);
    });
  });

  describe('2. Hotspot Focal Gravity & Dispersion Index', () => {
    it('rejects interfaces where active field fails to command decisive attention gravity', () => {
      // Active field salience 120 vs average background salience 90 -> Ratio 1.33 (< 2.20 floor!)
      const weakHotspot = auditHotspotDispersion({
        activeElementSalience: 120,
        averageInactiveSalience: 90,
      });

      expect(weakHotspot.passes).toBe(false);
      expect(weakHotspot.attentionRatio).toBe(1.33);
      expect(weakHotspot.violation).toContain('focal gravity ratio');
    });

    it('approves decisive focal anchoring when active field commands foveal gaze', () => {
      // Active field salience 220 vs average background salience 75 -> Ratio 2.93 (>= 2.20)
      const strongHotspot = auditHotspotDispersion({
        activeElementSalience: 220,
        averageInactiveSalience: 75,
      });

      expect(strongHotspot.passes).toBe(true);
      expect(strongHotspot.attentionRatio).toBe(2.93);
    });
  });

  describe('3. Adaptive Density Profile Verification', () => {
    it('validates compact density mode satisfies Fitts law touch envelope via hit slop', () => {
      // Compact enterprise table input: 38px visual height with 44px hit envelope
      const compactInput = auditAdaptiveDensity({
        mode: 'compact',
        visualHeightPx: 38,
        touchEnvelopePx: 44,
        paddingPx: 8,
      });

      expect(compactInput.passes).toBe(true);
      expect(compactInput.touchEnvelopePasses).toBe(true);
      expect(compactInput.densityCompliant).toBe(true);
    });

    it('rejects compact elements that cut touch envelopes below 44px', () => {
      const recklessCompact = auditAdaptiveDensity({
        mode: 'compact',
        visualHeightPx: 32, // below 34px compact floor
        touchEnvelopePx: 32, // fails 44px touch floor
        paddingPx: 4,
      });

      expect(recklessCompact.passes).toBe(false);
      expect(recklessCompact.touchEnvelopePasses).toBe(false);
      expect(recklessCompact.violation).toContain('Fitts\' Law floor');
    });

    it('validates spacious onboarding mode', () => {
      const spaciousHero = auditAdaptiveDensity({
        mode: 'spacious',
        visualHeightPx: 56,
        touchEnvelopePx: 56,
        paddingPx: 24,
      });

      expect(spaciousHero.passes).toBe(true);
    });
  });
});
