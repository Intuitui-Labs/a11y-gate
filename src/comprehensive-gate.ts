/**
 * @intuitui-labs/a11y-gate - Comprehensive A11y & Cognitive Quality Gatekeeper
 *
 * Single-entrypoint CI/CD and Design System orchestrator that synthesizes:
 * 1. Ratio Doctrine & Spatial Gestalt (Enclosure, Proximity, Margin Hierarchy)
 * 2. Hotspot Affordance Diversity (ADQ + Consecutive Monotony Streak Limit)
 * 3. Hotspot Focal Saliency & Attention Ratio (HSDI)
 * 4. Dual-Standard Contrast Matrix (WCAG 2.1/2.2 AA/AAA Baseline + WCAG 3 APCA 0.98G Standard)
 * 5. Theme Token Set & Multi-Vector CVD Simulation (Deut, Prot, Trit + Chromostereopsis)
 * 6. Visual Shannon Entropy & Cognitive Clutter Index
 * 7. Mobile Ergonomics & Polar Thumb-Zone Sweep
 */

import {
  auditPsychophysicalRatios,
  type PsychophysicalRatioAuditInput,
  type PsychophysicalRatioAuditResult,
} from './ratio-doctrine.js';

import {
  auditAffordanceDiversity,
  auditHotspotDispersion,
  type FormFieldModality,
  type AffordanceDiversityResult,
  type HotspotDispersionResult,
} from './hotspot-diversity.js';

import {
  auditThemeTokenSet,
  type ThemeTokenSet,
  type ThemeAuditResult,
} from './platform-audit.js';

import {
  auditMultiStandardBaseline,
  type MultiStandardColorPairSpec,
  type SemanticHtml5CheckSpec,
  type MultiStandardResult,
} from './standards-matrix.js';

import {
  evaluateCtaVisualDominance,
  evaluateCognitiveEntropy,
  evaluatePolarThumbArc,
  type InteractiveVisualTarget,
  type CtaDominanceResult,
  type ViewportEntropySpec,
  type CognitiveEntropyResult,
  type MobileThumbTarget,
  type ThumbZoneErgonomicsResult,
} from './creative-cognition.js';

import {
  auditFormSchemaAffordance,
  type FormSchemaField,
  type FormStepSchema,
  type SchemaAffordanceAuditResult,
} from './schema-adapter.js';

import type { Wcag3ConformanceLevel } from './wcag3.js';

export interface ComprehensiveA11yGateSpec {
  name: string;
  theme?: ThemeTokenSet;
  ratioSpec?: PsychophysicalRatioAuditInput;
  fields?: FormSchemaField[];
  schemaStep?: FormStepSchema;
  hotspots?: {
    fieldModalities: FormFieldModality[];
    minAdqThreshold?: number;
    maxConsecutiveMonotonyThreshold?: number;
    activeElementSalience?: number;
    averageInactiveSalience?: number;
    minAttentionRatio?: number;
  };
  saliencyTargets?: InteractiveVisualTarget[];
  entropyConfig?: ViewportEntropySpec;
  thumbTarget?: MobileThumbTarget;
  colorPairs?: MultiStandardColorPairSpec[];
  semanticSpec?: SemanticHtml5CheckSpec;
  minPassScore?: number; // default 80
}

export interface ComprehensiveSubsystemSummary {
  ratioPassed: boolean;
  diversityPassed: boolean;
  hotspotDispersionPassed: boolean;
  saliencyPassed: boolean;
  entropyPassed: boolean;
  thumbErgonomicsPassed: boolean;
  themePassed: boolean;
  baselinePassed: boolean;
  wcag3Passed: boolean;
}

export interface ComprehensiveA11yGateResult {
  name: string;
  passesGate: boolean;
  score: number; // 0 to 100
  grade: 'AAA' | 'AA' | 'A' | 'Fail';
  wcag3Tier: Wcag3ConformanceLevel;
  baselineGrade: 'AAA' | 'AA' | 'Fail';
  subsystems: ComprehensiveSubsystemSummary;
  errors: string[];
  advisories: string[];
  violations: string[]; // Aliased to errors for backwards-compatibility
  remediations: string[];
  detailedReports: {
    ratio?: PsychophysicalRatioAuditResult;
    diversity?: AffordanceDiversityResult;
    schemaAffordance?: SchemaAffordanceAuditResult;
    hotspotDispersion?: HotspotDispersionResult;
    theme?: ThemeAuditResult;
    multiStandard?: MultiStandardResult;
    saliency?: CtaDominanceResult;
    entropy?: CognitiveEntropyResult;
    thumbErgonomics?: ThumbZoneErgonomicsResult;
  };
}

/**
 * Universal CI/CD & Design System Gate Runner
 * Executes a holistic quality audit across all cognitive, spatial, and mathematical gates.
 */
export function auditComprehensiveA11yGate(
  spec: ComprehensiveA11yGateSpec
): ComprehensiveA11yGateResult {
  const errors: string[] = [];
  const advisories: string[] = [];
  const remediations: string[] = [];

  let ratioPassed = true;
  let diversityPassed = true;
  let hotspotDispersionPassed = true;
  let saliencyPassed = true;
  let entropyPassed = true;
  let thumbErgonomicsPassed = true;
  let themePassed = true;
  let baselinePassed = true;
  let wcag3Passed = true;

  const detailedReports: ComprehensiveA11yGateResult['detailedReports'] = {};

  // 1. Concrete Form Schema Adapter
  if (spec.schemaStep || spec.fields) {
    try {
      const stepInput: FormStepSchema = spec.schemaStep ?? {
        stepId: spec.name.toLowerCase().replace(/\s+/g, '-'),
        fields: spec.fields ?? [],
      };
      const schemaRes = auditFormSchemaAffordance(stepInput);
      detailedReports.schemaAffordance = schemaRes;
      detailedReports.diversity = schemaRes.diversity;
      diversityPassed = schemaRes.passes;
      if (!schemaRes.passes && schemaRes.diversity.violation) {
        advisories.push(schemaRes.diversity.violation);
        if (schemaRes.diversity.recommendation) {
          remediations.push(schemaRes.diversity.recommendation);
        }
      }
      if (schemaRes.advisories.length > 0) {
        advisories.push(...schemaRes.advisories);
      }
    } catch (err: any) {
      errors.push(`Schema affordance audit crash: ${err?.message ?? 'unknown'}`);
    }
  }

  // 2. Ratio Doctrine & Spatial Gestalt
  if (spec.ratioSpec) {
    try {
      const ratioRes = auditPsychophysicalRatios(spec.ratioSpec);
      detailedReports.ratio = ratioRes;
      ratioPassed = ratioRes.passes;
      if (!ratioRes.passes) {
        for (const v of ratioRes.violations) {
          // Classify hard accessibility barriers vs soft spatial advisories
          if (
            v.includes('contrast') ||
            v.includes('Touch hit target') ||
            v.includes('12px absolute legibility') ||
            v.includes('diffraction')
          ) {
            errors.push(v);
          } else {
            advisories.push(v);
          }
        }
        remediations.push(...ratioRes.recommendations);
      }
    } catch (err: any) {
      ratioPassed = false;
      errors.push(`Ratio doctrine audit crash: ${err?.message ?? 'unknown'}`);
    }
  }

  // 3. Hotspot Affordance Diversity (Manual fallback if schema not passed)
  if (spec.hotspots && !detailedReports.diversity) {
    try {
      const divRes = auditAffordanceDiversity({
        fieldModalities: spec.hotspots.fieldModalities,
        minAdqThreshold: spec.hotspots.minAdqThreshold,
        maxConsecutiveMonotonyThreshold: spec.hotspots.maxConsecutiveMonotonyThreshold,
      });
      detailedReports.diversity = divRes;
      diversityPassed = divRes.passes;
      if (!divRes.passes) {
        if (divRes.violation) advisories.push(divRes.violation);
        if (divRes.recommendation) remediations.push(divRes.recommendation);
      }

      if (
        spec.hotspots.activeElementSalience !== undefined &&
        spec.hotspots.averageInactiveSalience !== undefined
      ) {
        const dispRes = auditHotspotDispersion({
          activeElementSalience: spec.hotspots.activeElementSalience,
          averageInactiveSalience: spec.hotspots.averageInactiveSalience,
          minAttentionRatio: spec.hotspots.minAttentionRatio,
        });
        detailedReports.hotspotDispersion = dispRes;
        hotspotDispersionPassed = dispRes.passes;
        if (!dispRes.passes && dispRes.violation) {
          advisories.push(dispRes.violation);
          remediations.push('Elevate active element contrast or padding to command decisive foveal gaze.');
        }
      }
    } catch (err: any) {
      diversityPassed = false;
      errors.push(`Hotspot diversity audit crash: ${err?.message ?? 'unknown'}`);
    }
  }

  // 4. Theme & CVD Tokens
  if (spec.theme) {
    try {
      const themeRes = auditThemeTokenSet(spec.theme);
      detailedReports.theme = themeRes;
      themePassed = themeRes.passes;
      if (!themeRes.passes) {
        errors.push(...themeRes.violations);
        remediations.push('Adjust design system color tokens to satisfy WCAG 2.2, APCA floors, and CVD simulation.');
      }
    } catch (err: any) {
      themePassed = false;
      errors.push(`Theme token audit crash: ${err?.message ?? 'unknown'}`);
    }
  }

  // 5. Dual-Standard & Multi-Standard Baseline
  let baselineGrade: 'AAA' | 'AA' | 'Fail' = 'AAA';
  let wcag3Tier: Wcag3ConformanceLevel = 'Gold';

  if (spec.colorPairs || spec.semanticSpec) {
    try {
      const stdRes = auditMultiStandardBaseline({
        name: spec.name,
        colorPairs: spec.colorPairs,
        semanticSpec: spec.semanticSpec,
      });
      detailedReports.multiStandard = stdRes;
      baselinePassed = stdRes.baseline.passesLegalBaseline;
      wcag3Passed = stdRes.standardWcag3.passesPerceptualStandard;
      baselineGrade = stdRes.compositeSummary.baselineGrade;
      wcag3Tier = stdRes.compositeSummary.wcag3StandardTier;

      if (!stdRes.passesAllStandards) {
        if (!baselinePassed) {
          errors.push(`Legal baseline non-compliance: Grade ${baselineGrade}`);
        }
        if (!wcag3Passed) {
          errors.push(`Modern WCAG 3 perceptual risk: Failed to achieve Silver reading floor (Tier: ${wcag3Tier})`);
          remediations.push('Increase text contrast to reach APCA |Lc| >= 75 for body copy or >= 65 for controls.');
        }
      }
    } catch (err: any) {
      baselinePassed = false;
      wcag3Passed = false;
      errors.push(`Multi-standard baseline audit crash: ${err?.message ?? 'unknown'}`);
    }
  }

  // 6. Visual Saliency & CTA Dominance
  if (spec.saliencyTargets && spec.saliencyTargets.length > 0) {
    try {
      const salRes = evaluateCtaVisualDominance(spec.saliencyTargets);
      detailedReports.saliency = salRes;
      saliencyPassed = salRes.passes;
      if (!salRes.passes) {
        advisories.push(...salRes.violations);
        remediations.push('Reduce distractor prominence or enlarge primary CTA to maintain >= 1.25x visual dominance.');
      }
    } catch (err: any) {
      saliencyPassed = false;
      errors.push(`Saliency audit crash: ${err?.message ?? 'unknown'}`);
    }
  }

  // 7. Cognitive Shannon Entropy
  if (spec.entropyConfig) {
    try {
      const entRes = evaluateCognitiveEntropy(spec.entropyConfig);
      detailedReports.entropy = entRes;
      entropyPassed = entRes.passes;
      if (!entRes.passes) {
        advisories.push(...entRes.violations);
        remediations.push('Unify fonts, colors, and border radii to lower visual entropy below 45/100.');
      }
    } catch (err: any) {
      entropyPassed = false;
      errors.push(`Cognitive entropy audit crash: ${err?.message ?? 'unknown'}`);
    }
  }

  // 8. Mobile Thumb Ergonomics
  if (spec.thumbTarget) {
    try {
      const thumbRes = evaluatePolarThumbArc(spec.thumbTarget);
      detailedReports.thumbErgonomics = thumbRes;
      thumbErgonomicsPassed = thumbRes.passes;
      if (!thumbRes.passes) {
        advisories.push(...thumbRes.violations);
        remediations.push('Anchor primary mobile actions in the bottom natural sweep zone (<= 240px from thumb pivot).');
      }
    } catch (err: any) {
      thumbErgonomicsPassed = false;
      errors.push(`Thumb ergonomics audit crash: ${err?.message ?? 'unknown'}`);
    }
  }

  // Combined violations list for backwards compatibility
  const allViolations = [...errors, ...advisories];

  // Composite Score Calculation:
  // Hard errors deduct 20 points; soft advisories deduct 5 points
  const rawScore = Math.max(0, 100 - errors.length * 20 - advisories.length * 5);
  const minScore = spec.minPassScore ?? 80;

  // Hard blocking gates: Legal baseline, WCAG 3 tier, theme contrast, and hard accessibility errors
  const passesGate = errors.length === 0 && rawScore >= minScore;

  let grade: 'AAA' | 'AA' | 'A' | 'Fail' = 'Fail';
  if (passesGate) {
    if (rawScore >= 95 && baselineGrade === 'AAA' && (wcag3Tier === 'Gold' || wcag3Tier === 'Silver')) {
      grade = 'AAA';
    } else if (rawScore >= 85) {
      grade = 'AA';
    } else {
      grade = 'A';
    }
  }

  return {
    name: spec.name,
    passesGate,
    score: rawScore,
    grade,
    wcag3Tier,
    baselineGrade,
    subsystems: {
      ratioPassed,
      diversityPassed,
      hotspotDispersionPassed,
      saliencyPassed,
      entropyPassed,
      thumbErgonomicsPassed,
      themePassed,
      baselinePassed,
      wcag3Passed,
    },
    errors,
    advisories,
    violations: allViolations,
    remediations: Array.from(new Set(remediations)),
    detailedReports,
  };
}
