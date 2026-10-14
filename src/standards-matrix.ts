/**
 * @intuitui-labs/a11y-gate - Multi-Standard Accessibility Matrix
 *
 * Combines industry-standard engines into a unified baseline:
 * 1. Deque Axe-Core (WCAG 2.1/2.2 AA low-false-positive engine)
 * 2. HTML CodeSniffer (HTMLCS / Pa11y: WCAG 2.1 AAA & Section 508)
 * 3. W3C Semantic HTML5 & Autocomplete Token Safety (SC 1.3.5)
 */

import { evaluateAxeBaseline, AxeResultsLike, AxeBaselineAuditResult } from './axe-baseline.js';

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

export function evaluateHtmlCsBaseline(messages: HtmlCsMessage[]): HtmlCsBaselineResult {
  const errors = messages.filter(m => m.type === 'error');
  const warnings = messages.filter(m => m.type === 'warning');

  const contrastErrors: string[] = [];
  const structureErrors: string[] = [];
  const allErrors: string[] = [];

  for (const err of errors) {
    const desc = `[${err.code}] ${err.msg}`;
    allErrors.push(desc);
    if (err.code.includes('1_4_6') || err.code.includes('Contrast')) {
      contrastErrors.push(desc);
    } else {
      structureErrors.push(desc);
    }
  }

  return {
    passesAaa: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    contrastErrors,
    structureErrors,
    allErrors,
  };
}

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

export function evaluateSemanticHtml5(spec: SemanticHtml5CheckSpec): SemanticHtml5Result {
  const violations: string[] = [];

  if (!spec.hasLangAttribute) {
    violations.push('<html> element is missing a valid [lang] attribute (WCAG 3.1.1).');
  }
  if (!spec.hasDocumentTitle) {
    violations.push('Document is missing a descriptive <title> tag (WCAG 2.4.2).');
  }
  if (spec.formControlsMissingAutocomplete.length > 0) {
    violations.push(
      `Personal data inputs missing autocomplete tokens: ${spec.formControlsMissingAutocomplete.join(', ')} (WCAG 2.1 SC 1.3.5 AAA).`
    );
  }
  if (spec.buttonsMissingType.length > 0) {
    violations.push(
      `<button> elements missing explicit type="button|submit|reset": ${spec.buttonsMissingType.length} elements.`
    );
  }
  if (spec.duplicateIds.length > 0) {
    violations.push(`Duplicate DOM IDs detected: ${spec.duplicateIds.join(', ')} (violates HTML5 specification).`);
  }

  return {
    passes: violations.length === 0,
    violations,
  };
}

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

export function auditMultiStandardBaseline(spec: MultiStandardSpec): MultiStandardResult {
  const axe = spec.axeResults
    ? evaluateAxeBaseline(spec.axeResults)
    : {
        passesBaseline: true,
        violationCount: 0,
        criticalCount: 0,
        seriousCount: 0,
        moderateCount: 0,
        minorCount: 0,
        formattedViolations: [],
      };

  const htmlcs = spec.htmlCsMessages ? evaluateHtmlCsBaseline(spec.htmlCsMessages) : undefined;
  const semantic = spec.semanticSpec ? evaluateSemanticHtml5(spec.semanticSpec) : undefined;

  const totalViolations =
    axe.violationCount +
    (htmlcs?.errorCount ?? 0) +
    (semantic?.violations.length ?? 0);

  const passesAllStandards = totalViolations === 0;

  let grade: 'AAA' | 'AA' | 'Fail' = 'Fail';
  if (passesAllStandards) {
    grade = 'AAA';
  } else if (axe.passesBaseline && (htmlcs ? htmlcs.contrastErrors.length === 0 : true)) {
    grade = 'AA';
  }

  return {
    name: spec.name,
    passesAllStandards,
    axe,
    htmlcs,
    semantic,
    compositeSummary: {
      totalViolations,
      grade,
    },
  };
}
