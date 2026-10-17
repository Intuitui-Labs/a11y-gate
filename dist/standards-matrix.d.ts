/**
 * @intuitui-labs/a11y-gate - Multi-Standard Accessibility Matrix
 *
 * Combines industry-standard engines into a unified baseline:
 * 1. Deque Axe-Core (WCAG 2.1/2.2 AA low-false-positive engine)
 * 2. HTML CodeSniffer (HTMLCS / Pa11y: WCAG 2.1 AAA & Section 508)
 * 3. W3C Semantic HTML5 & Autocomplete Token Safety (SC 1.3.5)
 */
import { AxeResultsLike, AxeBaselineAuditResult } from './axe-baseline.js';
import { type TextRole, type Wcag3ConformanceLevel, type Wcag3FontWeightMatrix } from './wcag3.js';
export interface HtmlCsMessage {
    type: 'error' | 'warning' | 'notice';
    code: string;
    msg: string;
    element?: string;
}
export interface HtmlCsBaselineResult {
    passesAaa: boolean;
    errorCount: number;
    warningCount: number;
    contrastErrors: string[];
    structureErrors: string[];
    allErrors: string[];
}
export declare function evaluateHtmlCsBaseline(messages: HtmlCsMessage[]): HtmlCsBaselineResult;
export interface SemanticHtml5CheckSpec {
    hasLangAttribute: boolean;
    hasDocumentTitle: boolean;
    formControlsMissingAutocomplete: string[];
    buttonsMissingType: string[];
    duplicateIds: string[];
}
export interface SemanticHtml5Result {
    passes: boolean;
    violations: string[];
}
export declare function evaluateSemanticHtml5(spec: SemanticHtml5CheckSpec): SemanticHtml5Result;
export interface DualStandardContrastResult {
    fg: string;
    bg: string;
    role: TextRole;
    baseline: {
        wcagRatio: number;
        passesAA: boolean;
        passesAAA: boolean;
        passesUiComponent: boolean;
        legalStatus: 'Compliant-AAA' | 'Compliant-AA' | 'Non-Compliant';
    };
    standard: {
        wcag3Score: number;
        absLc: number;
        polarity: 'BoW' | 'WoB';
        level: Wcag3ConformanceLevel;
        passesRole: boolean;
        ratingText: string;
        minFontMatrix: Wcag3FontWeightMatrix;
    };
    verdict: {
        passesBaseline: boolean;
        passesStandard: boolean;
        passesBoth: boolean;
        guidance: string;
    };
}
/**
 * Standard Dual-Engine Contrast Evaluator:
 * Simultaneously benchmarks against the legal enforceable baseline (WCAG 2.1/2.2 AA & AAA)
 * and the modern perceptual standard (WCAG 3 APCA 0.98G Candidate Model).
 */
export declare function auditDualStandardContrast(fg: string, bg: string, role?: TextRole): DualStandardContrastResult;
export interface MultiStandardColorPairSpec {
    id?: string;
    fg: string;
    bg: string;
    role?: TextRole;
}
export interface MultiStandardSpec {
    name: string;
    axeResults?: AxeResultsLike;
    htmlCsMessages?: HtmlCsMessage[];
    semanticSpec?: SemanticHtml5CheckSpec;
    colorPairs?: MultiStandardColorPairSpec[];
}
export interface MultiStandardResult {
    name: string;
    passesAllStandards: boolean;
    axe: AxeBaselineAuditResult;
    htmlcs?: HtmlCsBaselineResult;
    semantic?: SemanticHtml5Result;
    baseline: {
        passesLegalBaseline: boolean;
        axe: AxeBaselineAuditResult;
        htmlcs?: HtmlCsBaselineResult;
        semantic?: SemanticHtml5Result;
        wcag2PassCount: number;
        wcag2FailCount: number;
    };
    standardWcag3: {
        passesPerceptualStandard: boolean;
        evaluatedPairs: DualStandardContrastResult[];
        conformanceTiers: Record<Wcag3ConformanceLevel, number>;
    };
    compositeSummary: {
        totalViolations: number;
        grade: 'AAA' | 'AA' | 'Fail';
        baselineGrade: 'AAA' | 'AA' | 'Fail';
        wcag3StandardTier: Wcag3ConformanceLevel;
        isFullyCompliant: boolean;
        summaryText: string;
    };
}
export declare function auditMultiStandardBaseline(spec: MultiStandardSpec): MultiStandardResult;
