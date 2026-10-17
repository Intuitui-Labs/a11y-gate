/**
 * @intuitui/a11y-gate - Universal Vitest / Jest Test Suite Runner
 * Runs all mathematical gates for any application with one line of code:
 * `runA11ySuite({ name: 'Neevsk', tokens: NEEVSK_PAIRS, typeScale: NEEVSK_SCALE }, { describe, it, expect });`
 */

import { evaluateWcag, evaluateApca, getWcagContrastRatio } from './contrast-math.js';
import { simulateCvdHex } from './cvd-simulator.js';
import { evaluateTargetSize, isValidSpatialQuantum, SPATIAL_INTERVALS } from './spatial-math.js';
import type { GateConfig } from './token-types.js';

export interface TestRunnerBindings {
  describe: (name: string, fn: () => void) => void;
  it: (name: string, fn: () => void) => void;
  expect: any;
}

export function runA11ySuite(config: GateConfig, { describe, it, expect }: TestRunnerBindings): void {
  describe(`[${config.name}] A11y Gate 1: Contrast & Perceptual Mathematics`, () => {
    it('certifies that ALL registered production token pairs pass WCAG & APCA requirements', () => {
      for (const pair of config.tokens) {
        const expectedWcag = pair.expectedWcagMin ?? 4.5;
        const expectedApca = pair.expectedApcaMin ?? 60;

        const wcag = evaluateWcag(pair.fg, pair.bg);
        const apca = evaluateApca(pair.fg, pair.bg);

        expect(
          wcag.ratio,
          `Token pair [${pair.id}] (${pair.name}) failed WCAG! Got ${wcag.ratio}:1, required >= ${expectedWcag}:1`
        ).toBeGreaterThanOrEqual(expectedWcag);

        expect(
          apca.absLc,
          `Token pair [${pair.id}] (${pair.name}) failed APCA! Got |Lc| ${apca.absLc}, required >= ${expectedApca}`
        ).toBeGreaterThanOrEqual(expectedApca);
      }
    });

    if (config.testCvd !== false) {
      it('certifies that token pairs maintain >= 4.0:1 contrast under simulated Deuteranopia, Protanopia & Tritanopia', () => {
        for (const pair of config.tokens) {
          // Test pairs meant for text
          if ((pair.expectedWcagMin ?? 4.5) >= 4.5) {
            const deutfg = simulateCvdHex(pair.fg, 'deuteranopia');
            const deutbg = simulateCvdHex(pair.bg, 'deuteranopia');
            const deutRatio = getWcagContrastRatio(deutfg, deutbg);

            expect(
              deutRatio,
              `Token pair [${pair.id}] failed Deuteranopia (green-blind) contrast check! Got ${deutRatio}:1`
            ).toBeGreaterThanOrEqual(4.0);

            const protfg = simulateCvdHex(pair.fg, 'protanopia');
            const protbg = simulateCvdHex(pair.bg, 'protanopia');
            const protRatio = getWcagContrastRatio(protfg, protbg);

            expect(
              protRatio,
              `Token pair [${pair.id}] failed Protanopia (red-blind) contrast check! Got ${protRatio}:1`
            ).toBeGreaterThanOrEqual(4.0);

            const tritfg = simulateCvdHex(pair.fg, 'tritanopia');
            const tritbg = simulateCvdHex(pair.bg, 'tritanopia');
            const tritRatio = getWcagContrastRatio(tritfg, tritbg);

            expect(
              tritRatio,
              `Token pair [${pair.id}] failed Tritanopia (blue-blind) contrast check! Got ${tritRatio}:1`
            ).toBeGreaterThanOrEqual(4.0);
          }
        }
      });
    }
  });

  if (config.typeScale) {
    describe(`[${config.name}] A11y Gate 2: Spatial Rhythm & Typographic Scale`, () => {
      it('ensures minimum micro-badge font size is never below threshold', () => {
        const minThreshold = config.minimumMicroPx ?? 14;
        const micro = config.typeScale?.['micro'];
        if (micro) {
          expect(micro.minPx).toBeGreaterThanOrEqual(minThreshold);
        }
      });

      it('verifies spatial intervals strictly conform to the 4px/8px quantum grid', () => {
        const intervals = config.spatialIntervals ?? SPATIAL_INTERVALS;
        for (const interval of intervals) {
          expect(isValidSpatialQuantum(interval)).toBe(true);
        }
      });

      it('evaluates touch targets against WCAG 2.2 standards (24px AA, 44px AAA)', () => {
        expect(evaluateTargetSize(48, 48).passesAaa).toBe(true);
        expect(evaluateTargetSize(24, 24).passesAa).toBe(true);
        expect(evaluateTargetSize(16, 16).passesAa).toBe(false);
      });
    });
  }
}
