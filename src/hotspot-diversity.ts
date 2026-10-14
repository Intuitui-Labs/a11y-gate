/**
 * @intuitui-labs/a11y-gate - Hotspot Dynamics, Affordance Diversity & Adaptive Density Engine
 * 
 * "Forms die from repetition suppression. Rhythmic diversity sustains cognition."
 * 
 * Formal cognitive & spatial models for:
 * 1. Affordance Diversity Quotient (ADQ) - combating sensory repetition suppression.
 * 2. Hotspot Focal Saliency & Dispersion Index (HSDI) - guiding saccadic scanpaths.
 * 3. Adaptive Density Profile Verification - compact, balanced, and spacious modes.
 */

// ── 1. AFFORDANCE DIVERSITY QUOTIENT (ADQ) ───────────────────────────

export type FormFieldModality =
  | 'text-typing'
  | 'tap-pill'
  | 'dual-column'
  | 'scrubbing-slider'
  | 'date-preset'
  | 'picker-search'
  | 'attachment'
  | 'stepper'
  | 'custom';

export interface AffordanceDiversitySpec {
  stepId?: string;
  fieldModalities: FormFieldModality[];
  minAdqThreshold?: number; // default 0.35
}

export interface AffordanceDiversityResult {
  passes: boolean;
  adq: number; // Affordance Diversity Quotient (0.0 to 1.0)
  uniqueModalities: FormFieldModality[];
  totalFields: number;
  hasRepetitionSuppressionHazard: boolean;
  violation?: string;
  recommendation?: string;
}

/**
 * Computes the Affordance Diversity Quotient (ADQ) of a form step.
 * Prevents "Grey Soup Syndrome" where users are subjected to endless identical text inputs.
 */
export function auditAffordanceDiversity(spec: AffordanceDiversitySpec): AffordanceDiversityResult {
  const totalFields = spec.fieldModalities.length;
  if (totalFields === 0) {
    return {
      passes: true,
      adq: 1.0,
      uniqueModalities: [],
      totalFields: 0,
      hasRepetitionSuppressionHazard: false,
    };
  }

  const uniqueModalities = Array.from(new Set(spec.fieldModalities));
  const adq = Math.round((uniqueModalities.length / totalFields) * 100) / 100;
  const threshold = spec.minAdqThreshold ?? 0.35;

  // Repetition suppression is critical when step has > 3 fields and ADQ is low
  const hasRepetitionSuppressionHazard = totalFields >= 4 && adq < threshold;
  const passes = !hasRepetitionSuppressionHazard;

  let violation: string | undefined;
  let recommendation: string | undefined;

  if (hasRepetitionSuppressionHazard) {
    violation = `Affordance Diversity Quotient (ADQ: ${adq}) is below threshold (${threshold}) for step "${spec.stepId ?? 'unnamed'}". With ${totalFields} fields and only ${uniqueModalities.length} interaction modality (${uniqueModalities.join(', ')}), users experience cognitive repetition suppression and scanning fatigue.`;
    recommendation = `Introduce interactive modality diversity: replace binary text inputs with tap-pills, pair coupled fields into dual-column rows, or provide 1-tap preset chips.`;
  }

  return {
    passes,
    adq,
    uniqueModalities,
    totalFields,
    hasRepetitionSuppressionHazard,
    violation,
    recommendation,
  };
}


// ── 2. HOTSPOT FOCAL SALIENCY & DISPERSION INDEX (HSDI) ───────────────

export interface HotspotDispersionSpec {
  activeElementSalience: number;
  averageInactiveSalience: number;
  minAttentionRatio?: number; // default 2.20
}

export interface HotspotDispersionResult {
  passes: boolean;
  attentionRatio: number;
  violation?: string;
}

/**
 * Validates that the active interactive hotspot commands decisive focal gravity
 * over passive background labels and inactive cards.
 */
export function auditHotspotDispersion(spec: HotspotDispersionSpec): HotspotDispersionResult {
  const minRatio = spec.minAttentionRatio ?? 2.20;
  const avg = Math.max(1, spec.averageInactiveSalience);
  const attentionRatio = Math.round((spec.activeElementSalience / avg) * 100) / 100;
  const passes = attentionRatio >= minRatio;

  let violation: string | undefined;
  if (!passes) {
    violation = `Hotspot focal gravity ratio (${attentionRatio}) is below the ${minRatio} threshold. The active field fails to decisively anchor the foveal gaze, causing eye wander and visual ambiguity.`;
  }

  return {
    passes,
    attentionRatio,
    violation,
  };
}


// ── 3. ADAPTIVE DENSITY PROFILE VERIFICATION ─────────────────────────

export type AdaptiveDensityMode = 'compact' | 'balanced' | 'spacious';

export interface AdaptiveDensitySpec {
  mode: AdaptiveDensityMode;
  visualHeightPx: number;
  touchEnvelopePx: number;
  paddingPx: number;
}

export interface AdaptiveDensityResult {
  passes: boolean;
  mode: AdaptiveDensityMode;
  touchEnvelopePasses: boolean;
  densityCompliant: boolean;
  violation?: string;
}

export const DENSITY_PROFILE_STANDARDS = {
  compact: {
    minVisualHeightPx: 34,
    maxVisualHeightPx: 42,
    minPaddingPx: 6,
    maxPaddingPx: 12,
  },
  balanced: {
    minVisualHeightPx: 44,
    maxVisualHeightPx: 52,
    minPaddingPx: 12,
    maxPaddingPx: 20,
  },
  spacious: {
    minVisualHeightPx: 52,
    maxVisualHeightPx: 68,
    minPaddingPx: 20,
    maxPaddingPx: 32,
  },
} as const;

/**
 * Validates that an element conforms to its declared adaptive density mode
 * while unconditionally enforcing the physical 44px Fitts' Law touch envelope.
 */
export function auditAdaptiveDensity(spec: AdaptiveDensitySpec): AdaptiveDensityResult {
  const standards = DENSITY_PROFILE_STANDARDS[spec.mode];
  const touchEnvelopePasses = spec.touchEnvelopePx >= 44;
  const heightOk =
    spec.visualHeightPx >= standards.minVisualHeightPx &&
    spec.visualHeightPx <= standards.maxVisualHeightPx;
  const paddingOk =
    spec.paddingPx >= standards.minPaddingPx &&
    spec.paddingPx <= standards.maxPaddingPx;

  const densityCompliant = heightOk && paddingOk;
  const passes = touchEnvelopePasses && densityCompliant;

  const violations: string[] = [];
  if (!touchEnvelopePasses) {
    violations.push(
      `Touch envelope (${spec.touchEnvelopePx}px) violates physical 44px Fitts' Law floor regardless of ${spec.mode} mode.`
    );
  }
  if (!densityCompliant) {
    violations.push(
      `Visual height (${spec.visualHeightPx}px) or padding (${spec.paddingPx}px) is outside the calibrated ${spec.mode} envelope (${standards.minVisualHeightPx}-${standards.maxVisualHeightPx}px height, ${standards.minPaddingPx}-${standards.maxPaddingPx}px padding).`
    );
  }

  return {
    passes,
    mode: spec.mode,
    touchEnvelopePasses,
    densityCompliant,
    violation: violations.length > 0 ? violations.join(' ') : undefined,
  };
}
