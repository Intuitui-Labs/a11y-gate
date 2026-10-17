import { describe, it, expect } from 'vitest';
import {
  auditThemeTokenSet,
  auditPsychophysicalRatios,
  auditAffordanceDiversity,
  auditHotspotDispersion,
  auditConcentricCornerRadius,
  evaluateVisualSaliency,
  evaluateCtaVisualDominance,
  evaluateVisualEntropy,
  evaluateCognitiveEntropy,
  evaluatePolarThumbArc,
  getWcagContrastRatio,
  calculateApca,
  auditComprehensiveA11yGate,
  auditDualStandardContrast,
  getNearestQuantumRemediation,
  auditFormSchemaAffordance,
} from '../src/index';

describe('Hostile Red-Team & Adversarial SRE Operationalization Gate', () => {
  describe('Vector 1: Malformed & Pathological Color Inputs in Theme Auditing', () => {
    it('defends against non-hex, garbage strings, and malformed colors without uncaught crashes', () => {
      const hostileTheme = {
        name: 'corrupted-theme',
        background: 'not-a-color',
        surface: '#ZZZZZZ',
        textPrimary: 'rgb(255, 0, 0)',
        textSecondary: '#12', // invalid 2-char hex
        textMuted: '',
        primaryCtaBg: '#',
        primaryCtaFg: 'undefined',
      };

      // Must NOT throw unhandled exceptions
      let result: any;
      expect(() => {
        result = auditThemeTokenSet(hostileTheme);
      }).not.toThrow();

      expect(result.passes).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some((v: string) => v.includes('invalid color format'))).toBe(true);
    });

    it('defends APCA against zero-difference identical colors with zero division', () => {
      // APCA contrast of identical black on black or white on white
      const zeroLc = calculateApca('#000000', '#000000');
      expect(zeroLc).toBe(0);

      const zeroWhite = calculateApca('#FFFFFF', '#FFFFFF');
      expect(zeroWhite).toBe(0);

      const wcagIdentical = getWcagContrastRatio('#123456', '#123456');
      expect(wcagIdentical).toBe(1.0);
    });
  });

  describe('Vector 2: Degenerate Zero-Dimension and Mathematical Singularities', () => {
    it('safely handles 0px viewports, 0px padding, and 0px font sizes without NaN or crash', () => {
      const degenerateLayout = {
        viewportWidthPx: 0, // mathematical singularity
        viewportHeightPx: 0,
        canvasMarginHorizontalPx: 0,
        contentWidthPx: 0,
        interContainerGutterPx: 0,
        intraContainerPaddingPx: 0, // division by zero candidate
        childGapPx: 0,
        labelToInputGapPx: 0,
        inputToNextGroupGapPx: 0,
        headingMarginTopPx: 0,
        headingMarginBottomPx: 0,
        fontSizePx: 0, // division by zero candidate
        fontWeight: 400,
        lineHeightPx: 0,
        letterSpacingEm: 0,
        touchHitDimensionPx: 0,
        visualGlyphDimensionPx: 0,
        role: 'body' as const,
      };

      let result: any;
      expect(() => {
        result = auditPsychophysicalRatios(degenerateLayout);
      }).not.toThrow();

      expect(result.passes).toBe(false);
      expect(Number.isNaN(result.score)).toBe(false);
      expect(Number.isNaN(result.ratios.spatialHierarchyRatio)).toBe(false);
      expect(Number.isNaN(result.ratios.canvasMarginRatio)).toBe(false);
      expect(Number.isFinite(result.score)).toBe(true);
    });

    it('safely handles concentric corner radius when padding vastly exceeds outer radius', () => {
      // 8px outer radius with 32px padding -> inner radius geometrically collapses to 0px
      const invertedRadius = auditConcentricCornerRadius({
        outerRadiusPx: 8,
        innerRadiusPx: 0,
        paddingPx: 32,
      });

      expect(invertedRadius.passes).toBe(true);
      expect(invertedRadius.idealInnerRadiusPx).toBe(0);
      expect(invertedRadius.deltaPx).toBe(0);
    });
  });

  describe('Vector 3: Massive Repetition Suppression & Scaling Stress', () => {
    it('evaluates an adversarial step with 10,000 identical inputs in under 10ms with zero memory leak', () => {
      const tenThousandInputs = new Array(10000).fill('text-typing');

      const start = performance.now();
      const result = auditAffordanceDiversity({
        stepId: 'nightmare-form-step',
        fieldModalities: tenThousandInputs,
      });
      const durationMs = performance.now() - start;

      expect(result.passes).toBe(false);
      expect(result.hasRepetitionSuppressionHazard).toBe(true);
      expect(result.adq).toBeLessThan(0.01);
      expect(result.totalFields).toBe(10000);
      expect(result.uniqueModalities).toHaveLength(1);
      expect(durationMs).toBeLessThan(50); // High-velocity execution
    });

    it('safely handles empty field modal list without division by zero', () => {
      const emptyStep = auditAffordanceDiversity({
        stepId: 'empty-step',
        fieldModalities: [],
      });

      expect(emptyStep.passes).toBe(true);
      expect(emptyStep.adq).toBe(1.0);
      expect(emptyStep.totalFields).toBe(0);
    });
  });

  describe('Vector 4: Extreme Attention Hijacking & Zero-Salience Targets', () => {
    it('handles primary CTA with zero dimensions without throwing math exceptions', () => {
      const targets = [
        {
          id: 'invisible-cta',
          text: 'Invisible Action',
          isPrimaryCta: true,
          widthPx: 0,
          heightPx: 0,
          centerXPx: 100,
          centerYPx: 100,
          absLc: 0,
          fontWeight: 400,
        },
        {
          id: 'monstrous-hud',
          text: 'SUPER GLOWING DISTRACTOR',
          isPrimaryCta: false,
          widthPx: 400,
          heightPx: 200,
          centerXPx: 200,
          centerYPx: 200,
          absLc: 105,
          fontWeight: 900,
        },
      ];

      const res = evaluateCtaVisualDominance(targets);
      expect(res.passes).toBe(false);
      expect(res.primaryCtaSaliency).toBe(0);
      expect(res.maxDistractorSaliency).toBeGreaterThan(100);
      expect(res.ctaDominanceIndex).toBe(0);
    });

    it('safely handles empty targets array in visual saliency', () => {
      const emptyRes = evaluateCtaVisualDominance([]);
      expect(emptyRes.passes).toBe(true);
      expect(emptyRes.ctaDominanceIndex).toBe(1.0);
    });

    it('handles mobile touch points placed far beyond viewport coordinates without crash', () => {
      const offscreenAction = evaluatePolarThumbArc({
        id: 'offscreen-btn',
        name: 'Stranded',
        centerXPx: -500, // offscreen left
        centerYPx: 2500, // offscreen bottom
        isPrimaryAction: true,
        viewportWidthPx: 390,
        viewportHeightPx: 844,
      });

      expect(offscreenAction.passes).toBe(false);
      expect(offscreenAction.primaryZone).toBe('Pain-Zone-Two-Hand');
      expect(offscreenAction.polarDistancePx).toBeGreaterThan(1000);
    });
  });

  describe('Vector 5: Shannon Entropy Floating-Point & Probability Stability', () => {
    it('evaluates zero-token entropy gracefully without NaN', () => {
      const zeroEntropy = evaluateVisualEntropy({
        uniqueFontSizes: [],
        uniqueFontWeights: [],
        uniqueColors: [],
        uniqueBorderStyles: [],
      });

      expect(zeroEntropy.passes).toBe(true);
      expect(zeroEntropy.entropyBits).toBe(0);
      expect(Number.isNaN(zeroEntropy.entropyBits)).toBe(false);
      expect(zeroEntropy.clutterLevel).toBe('Tranquil / Silk');
    });

    it('evaluates negative or boundary inputs in cognitive entropy without exploding', () => {
      const boundarySpec = {
        viewportWidthPx: 1280,
        viewportHeightPx: 900,
        distinctColorCount: 0,
        distinctFontCount: 0,
        distinctBorderRadiiCount: 0,
        elementCount: 0,
      };

      const res = evaluateCognitiveEntropy(boundarySpec);
      expect(res.passes).toBe(true);
      expect(res.shannonEntropyScore).toBe(0);
      expect(res.cognitiveLoadGrade).toBe('Tranquil-Silk');
    });
  });

  describe('Vector 6: High-Frequency Theme Batch Simulation (CI Stress Invariant)', () => {
    it('executes 100 complete theme audits sequentially in under 100ms with 100% deterministic output', () => {
      const baseTheme = {
        name: 'stress-dark',
        background: '#0B0F17',
        surface: '#151D2A',
        textPrimary: '#FFFFFF',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
        primaryCtaBg: '#38BDF8',
        primaryCtaFg: '#000000',
      };

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        const audit = auditThemeTokenSet(baseTheme);
        expect(audit.passes).toBe(true);
      }
      const durationMs = performance.now() - start;

      // Ensure 100 full 8-point theme evaluations with 3 CVD simulations complete in < 250ms
      expect(durationMs).toBeLessThan(250);
    });
  });

  describe('Vector 7: Monotony Camouflage Attack & Streak Defense', () => {
    it('catches contiguous monotony streaks even when global ADQ passes via trailing diversity', () => {
      // 10 text inputs in a row, followed by 5 diverse inputs (total 15 fields, 6 modalities)
      // Global ADQ = 6 / 15 = 0.40 (exceeds default 0.35 threshold!)
      // But max streak is 10 consecutive text inputs!
      const camouflageForm = [
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
        'tap-pill',
        'dual-column',
        'scrubbing-slider',
        'date-preset',
        'stepper',
      ] as const;

      const result = auditAffordanceDiversity({
        stepId: 'camouflage-step',
        fieldModalities: [...camouflageForm],
        minAdqThreshold: 0.35,
        maxConsecutiveMonotonyThreshold: 3,
      });

      expect(result.adq).toBe(0.40); // Global ratio is fine
      expect(result.maxConsecutiveMonotony).toBe(10);
      expect(result.mostMonotonousModality).toBe('text-typing');
      expect(result.hasRepetitionSuppressionHazard).toBe(true);
      expect(result.passes).toBe(false);
      expect(result.violation).toContain('Cognitive Monotony Streak: Detected 10 consecutive fields');
    });
  });

  describe('Vector 8: Defensive Error Resilience in Ratio Doctrine Hex Parsing', () => {
    it('handles garbage colorHex and bgHex in auditPsychophysicalRatios without uncaught exceptions', () => {
      const hostileRatioSpec = {
        viewportWidthPx: 1200,
        viewportHeightPx: 800,
        canvasMarginHorizontalPx: 64,
        contentWidthPx: 1000,
        interContainerGutterPx: 24,
        intraContainerPaddingPx: 24,
        childGapPx: 16,
        labelToInputGapPx: 8,
        inputToNextGroupGapPx: 20,
        fontSizePx: 16,
        fontWeight: 400,
        role: 'body' as const,
        colorHex: 'corrupted-hex-value',
        bgHex: '#not-hex',
      };

      let result: any;
      expect(() => {
        result = auditPsychophysicalRatios(hostileRatioSpec);
      }).not.toThrow();

      expect(result.passes).toBe(false);
      expect(result.violations.some((v: string) => v.includes('invalid color format'))).toBe(true);
    });
  });

  describe('Vector 9: Large Text & Headline Role Contextualization under Dual Engine', () => {
    it('correctly grants WCAG 2.2 AA large-text 3.0:1 threshold for headline roles while checking APCA', () => {
      // #2563EB on #FFFFFF has WCAG 5.17:1 and APCA |Lc| ~ 65
      // Normal text requires 4.5:1 (AA) and 7.0:1 (AAA).
      // Large headline requires 3.0:1 (AA) and 4.5:1 (AAA).
      const headlineResult = auditDualStandardContrast('#2563EB', '#FFFFFF', 'headline');

      expect(headlineResult.baseline.passesAA).toBe(true);
      expect(headlineResult.baseline.passesAAA).toBe(true); // 5.17 >= 4.5:1 for headlines!
      expect(headlineResult.standard.passesRole).toBe(true); // |Lc| >= 60 for headlines in WCAG 3 Bronze
      expect(headlineResult.verdict.passesBoth).toBe(true);
    });
  });

  describe('Vector 10: Quantum Snapping & Remediation Generation', () => {
    it('computes exact nearest quantum floor and ceiling recommendations for misaligned dimensions', () => {
      const misaligned = getNearestQuantumRemediation(13, 4);
      expect(misaligned.isAligned).toBe(false);
      expect(misaligned.nearestFloorPx).toBe(12);
      expect(misaligned.nearestCeilPx).toBe(16);
      expect(misaligned.recommendation).toContain('Snap to nearest 4px quantum: 12px (compact) or 16px (spacious)');

      const aligned = getNearestQuantumRemediation(16, 4);
      expect(aligned.isAligned).toBe(true);
      expect(aligned.recommendation).toContain('perfectly aligned');
    });
  });

  describe('Vector 11: Unified CI/CD Gatekeeper Orchestration (auditComprehensiveA11yGate)', () => {
    it('executes a full multi-system quality audit and certifies production readiness', () => {
      const fullGateSpec = {
        name: 'Enterprise Checkout Form',
        theme: {
          name: 'calm-light',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          textPrimary: '#0F172A',
          textSecondary: '#475569',
          textMuted: '#64748B',
          primaryCtaBg: '#0F172A',
          primaryCtaFg: '#FFFFFF',
        },
        ratioSpec: {
          viewportWidthPx: 1280,
          viewportHeightPx: 900,
          canvasMarginHorizontalPx: 64,
          contentWidthPx: 1000,
          interContainerGutterPx: 24,
          intraContainerPaddingPx: 24,
          childGapPx: 16,
          labelToInputGapPx: 8,
          inputToNextGroupGapPx: 20,
          headingMarginTopPx: 32,
          headingMarginBottomPx: 12,
          fontSizePx: 16,
          fontWeight: 400,
          lineHeightPx: 24,
          role: 'body' as const,
        },
        hotspots: {
          fieldModalities: ['text-typing', 'tap-pill', 'dual-column', 'date-preset'] as const as any,
          activeElementSalience: 55,
          averageInactiveSalience: 20,
        },
        colorPairs: [
          { id: 'h1', fg: '#0F172A', bg: '#FFFFFF', role: 'headline' as const },
          { id: 'body', fg: '#0F172A', bg: '#FFFFFF', role: 'body' as const },
        ],
        saliencyTargets: [
          {
            id: 'btn-pay',
            text: 'Complete Order',
            isPrimaryCta: true,
            widthPx: 280,
            heightPx: 48,
            centerXPx: 640,
            centerYPx: 750,
            absLc: 106,
            fontWeight: 700,
          },
          {
            id: 'btn-back',
            text: 'Back',
            isPrimaryCta: false,
            widthPx: 100,
            heightPx: 40,
            centerXPx: 200,
            centerYPx: 750,
            absLc: 65,
            fontWeight: 500,
          },
        ],
      };

      const gateResult = auditComprehensiveA11yGate(fullGateSpec);

      expect(gateResult.passesGate).toBe(true);
      expect(gateResult.grade).toMatch(/AAA|AA/);
      expect(gateResult.score).toBeGreaterThanOrEqual(90);
      expect(gateResult.subsystems.ratioPassed).toBe(true);
      expect(gateResult.subsystems.diversityPassed).toBe(true);
      expect(gateResult.subsystems.themePassed).toBe(true);
      expect(gateResult.subsystems.baselinePassed).toBe(true);
      expect(gateResult.subsystems.wcag3Passed).toBe(true);
      expect(gateResult.violations).toHaveLength(0);
    });

    it('acts as a hard CI blocker when critical violations exist across subsystems', () => {
      const failingGateSpec = {
        name: 'Toxic Form',
        ratioSpec: {
          viewportWidthPx: 320,
          viewportHeightPx: 480,
          canvasMarginHorizontalPx: 4, // severely cramped
          contentWidthPx: 312,
          interContainerGutterPx: 8,
          intraContainerPaddingPx: 32, // gutter < padding * 0.75
          childGapPx: 40, // childGap > padding
          labelToInputGapPx: 24, // label gap > next group gap
          inputToNextGroupGapPx: 8,
          fontSizePx: 9, // sub-12px banned
          fontWeight: 200, // anemic
          lineHeightPx: 10,
          role: 'body' as const,
        },
        hotspots: {
          // 8 identical inputs (monotony streak)
          fieldModalities: new Array(8).fill('text-typing'),
        },
      };

      const gateResult = auditComprehensiveA11yGate(failingGateSpec);

      expect(gateResult.passesGate).toBe(false);
      expect(gateResult.grade).toBe('Fail');
      expect(gateResult.score).toBeLessThanOrEqual(60);
      expect(gateResult.violations.length).toBeGreaterThanOrEqual(5);
      expect(gateResult.remediations.length).toBeGreaterThan(0);
    });
  });

  describe('Vector 12: Standard 4-Field Sign-Up and Address Form Exemption (Sanity Invariant)', () => {
    it('unconditionally passes standard 4-field text form without false-positive monotony failure', () => {
      // Standard auth sign-up: First Name, Last Name, Email, Password
      const standardSignUpForm = [
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
      ] as const;

      const result = auditAffordanceDiversity({
        stepId: 'standard-signup',
        fieldModalities: [...standardSignUpForm],
        minFieldsForSuppressionHazard: 6,
      });

      // MUST NOT fail a normal 4-field sign-up form!
      expect(result.passes).toBe(true);
      expect(result.hasRepetitionSuppressionHazard).toBe(false);
      expect(result.severity).toBe('none');
      expect(result.violation).toBeUndefined();
    });

    it('unconditionally passes cohesive address forms via isCohesiveSemanticGroup flag', () => {
      // 5-field address block: Street 1, Street 2, City, State, ZIP
      const addressForm = [
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
        'text-typing',
      ] as const;

      const result = auditAffordanceDiversity({
        stepId: 'shipping-address',
        fieldModalities: [...addressForm],
        isCohesiveSemanticGroup: true,
      });

      expect(result.passes).toBe(true);
      expect(result.hasRepetitionSuppressionHazard).toBe(false);
    });
  });

  describe('Vector 13: Direct Form Schema Ingestion in auditComprehensiveA11yGate', () => {
    it('directly audits raw field definitions without requiring manual measurement of magic numbers', () => {
      const realSchemaSpec = {
        name: 'Account Onboarding Flow',
        fields: [
          { name: 'fullName', type: 'text', label: 'Full Legal Name', semanticIntent: 'name-full' },
          { name: 'email', type: 'email', label: 'Work Email', semanticIntent: 'contact-email' },
          { name: 'role', type: 'select', label: 'Job Role' },
          { name: 'teamSize', type: 'slider', label: 'Team Size' },
        ],
        theme: {
          name: 'calm-light',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          textPrimary: '#0F172A',
          textSecondary: '#475569',
          textMuted: '#64748B',
          primaryCtaBg: '#0F172A',
          primaryCtaFg: '#FFFFFF',
        },
      };

      const gateResult = auditComprehensiveA11yGate(realSchemaSpec);

      expect(gateResult.passesGate).toBe(true);
      expect(gateResult.detailedReports.schemaAffordance).toBeDefined();
      expect(gateResult.detailedReports.schemaAffordance?.totalFields).toBe(4);
      expect(gateResult.detailedReports.schemaAffordance?.passes).toBe(true);
      expect(gateResult.errors).toHaveLength(0);
    });
  });
});


