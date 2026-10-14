/**
 * @intuitui-labs/a11y-gate - Multi-Standard Accessibility Matrix
 *
 * Combines industry-standard engines into a unified baseline:
 * 1. Deque Axe-Core (WCAG 2.1/2.2 AA low-false-positive engine)
 * 2. HTML CodeSniffer (HTMLCS / Pa11y: WCAG 2.1 AAA & Section 508)
 * 3. W3C Semantic HTML5 & Autocomplete Token Safety (SC 1.3.5)
 */
import { AxeResultsLike, AxeBaselineAuditResult } from './axe-baseline.js';
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
export interface MultiStandardSpec {
    name: string;
    axeResults?: AxeResultsLike;
    htmlCsMessages?: HtmlCsMessage[];
    semanticSpec?: SemanticHtml5CheckSpec;
}
export interface MultiStandardResult {
    name: string;
    passesAllStandards: boolean;
    axe: AxeBaselineAuditResult;
    htmlcs?: HtmlCsBaselineResult;
    semantic?: SemanticHtml5Result;
    compositeSummary: {
        totalViolations: number;
        grade: 'AAA' | 'AA' | 'Fail';
    };
}
export declare function auditMultiStandardBaseline(spec: MultiStandardSpec): MultiStandardResult;
