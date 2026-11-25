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
import { type PsychophysicalRatioAuditInput, type PsychophysicalRatioAuditResult } from './ratio-doctrine.js';
import { type FormFieldModality, type AffordanceDiversityResult, type HotspotDispersionResult } from './hotspot-diversity.js';
import { type ThemeTokenSet, type ThemeAuditResult } from './platform-audit.js';
import { type MultiStandardColorPairSpec, type SemanticHtml5CheckSpec, type MultiStandardResult } from './standards-matrix.js';
import { type InteractiveVisualTarget, type CtaDominanceResult, type ViewportEntropySpec, type CognitiveEntropyResult, type MobileThumbTarget, type ThumbZoneErgonomicsResult } from './creative-cognition.js';
import { type FormSchemaField, type FormStepSchema, type SchemaAffordanceAuditResult } from './schema-adapter.js';
import { type ProportionalSpacingSpec, type ProportionalSpacingResult, type SpacingConformanceLevel } from './proportional-scale.js';
import type { Wcag3ConformanceLevel } from './wcag3.js';
export interface ComprehensiveA11yGateSpec {
    name: string;
    theme?: ThemeTokenSet;
    ratioSpec?: PsychophysicalRatioAuditInput;
    fields?: FormSchemaField[];
    schemaStep?: FormStepSchema;
    spacingSpecs?: ProportionalSpacingSpec[];
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
    minPassScore?: number;
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
    spacingPassed: boolean;
}
export interface ComprehensiveA11yGateResult {
    name: string;
    passesGate: boolean;
    score: number;
    grade: 'AAA' | 'AA' | 'A' | 'Fail';
    wcag3Tier: Wcag3ConformanceLevel;
    baselineGrade: 'AAA' | 'AA' | 'Fail';
    spacingTier: SpacingConformanceLevel;
    subsystems: ComprehensiveSubsystemSummary;
    errors: string[];
    advisories: string[];
    violations: string[];
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
        proportionalSpacing?: ProportionalSpacingResult[];
    };
}
/**
 * Universal CI/CD & Design System Gate Runner
 * Executes a holistic quality audit across all cognitive, spatial, and mathematical gates.
 */
export declare function auditComprehensiveA11yGate(spec: ComprehensiveA11yGateSpec): ComprehensiveA11yGateResult;
