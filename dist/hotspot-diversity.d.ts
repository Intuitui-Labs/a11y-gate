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
export type FormFieldModality = 'text-typing' | 'tap-pill' | 'dual-column' | 'scrubbing-slider' | 'date-preset' | 'picker-search' | 'attachment' | 'stepper' | 'custom';
export interface AffordanceDiversitySpec {
    stepId?: string;
    fieldModalities: FormFieldModality[];
    minAdqThreshold?: number;
    maxConsecutiveMonotonyThreshold?: number;
    minFieldsForSuppressionHazard?: number;
    isCohesiveSemanticGroup?: boolean;
}
export interface AffordanceDiversityResult {
    passes: boolean;
    adq: number;
    uniqueModalities: FormFieldModality[];
    totalFields: number;
    maxConsecutiveMonotony: number;
    mostMonotonousModality?: FormFieldModality;
    hasRepetitionSuppressionHazard: boolean;
    severity: 'none' | 'advisory' | 'warning';
    violation?: string;
    recommendation?: string;
}
/**
 * Computes the Affordance Diversity Quotient (ADQ) of a form step.
 * Prevents "Grey Soup Syndrome" where users are subjected to endless identical text inputs.
 * Enforces consecutive monotony threshold to break up long runs of repetitive inputs.
 * Exempts short cohesive steps (<= 5 fields) to prevent false-positive CI blockers on standard forms.
 */
export declare function auditAffordanceDiversity(spec: AffordanceDiversitySpec): AffordanceDiversityResult;
export interface HotspotDispersionSpec {
    activeElementSalience: number;
    averageInactiveSalience: number;
    minAttentionRatio?: number;
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
export declare function auditHotspotDispersion(spec: HotspotDispersionSpec): HotspotDispersionResult;
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
export declare const DENSITY_PROFILE_STANDARDS: {
    readonly compact: {
        readonly minVisualHeightPx: 34;
        readonly maxVisualHeightPx: 42;
        readonly minPaddingPx: 6;
        readonly maxPaddingPx: 12;
    };
    readonly balanced: {
        readonly minVisualHeightPx: 44;
        readonly maxVisualHeightPx: 52;
        readonly minPaddingPx: 12;
        readonly maxPaddingPx: 20;
    };
    readonly spacious: {
        readonly minVisualHeightPx: 52;
        readonly maxVisualHeightPx: 68;
        readonly minPaddingPx: 20;
        readonly maxPaddingPx: 32;
    };
};
/**
 * Validates that an element conforms to its declared adaptive density mode
 * while unconditionally enforcing the physical 44px Fitts' Law touch envelope.
 */
export declare function auditAdaptiveDensity(spec: AdaptiveDensitySpec): AdaptiveDensityResult;
