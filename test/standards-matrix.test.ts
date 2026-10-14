import { describe, it, expect } from 'vitest';
import {
  evaluateHtmlCsBaseline,
  evaluateSemanticHtml5,
  auditMultiStandardBaseline,
} from '../src/standards-matrix';

describe('Multi-Standard Matrix: HTML CodeSniffer (HTMLCS) Baseline', () => {
  it('correctly categorizes WCAG 2.1 AAA contrast and structure errors', () => {
    const res = evaluateHtmlCsBaseline([
      { type: 'error', code: 'WCAG2AAA.Principle1.Guideline1_4.1_4_6.G17.Fail', msg: 'Expected 7:1 contrast ratio' },
      { type: 'error', code: 'WCAG2AAA.Principle1.Guideline1_3.1_3_1.H42', msg: 'Heading markup not semantic' },
      { type: 'warning', code: 'WCAG2AAA.Principle2.Guideline2_4.2_4_2.H25', msg: 'Title check' },
    ]);
    expect(res.passesAaa).toBe(false);
    expect(res.errorCount).toBe(2);
    expect(res.contrastErrors.length).toBe(1);
    expect(res.structureErrors.length).toBe(1);
  });
});

describe('Multi-Standard Matrix: Semantic HTML5 & Autocomplete Tokens', () => {
  it('flags missing lang attribute and missing autocomplete on personal inputs', () => {
    const res = evaluateSemanticHtml5({
      hasLangAttribute: false,
      hasDocumentTitle: true,
      formControlsMissingAutocomplete: ['fullName', 'email'],
      buttonsMissingType: ['button-1'],
      duplicateIds: [],
    });
    expect(res.passes).toBe(false);
    expect(res.violations.some(v => v.includes('[lang] attribute'))).toBe(true);
    expect(res.violations.some(v => v.includes('autocomplete tokens'))).toBe(true);
  });
});
