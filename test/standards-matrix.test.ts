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

describe('Dual-Standard Engine: Baseline WCAG 2.2 + Modern Standard WCAG 3 (APCA)', () => {
  import('../src/standards-matrix'); // type check

  it('evaluates optimal pair that satisfies both WCAG 2.2 AAA and WCAG 3 Gold', async () => {
    const { auditDualStandardContrast } = await import('../src/standards-matrix');
    const result = auditDualStandardContrast('#000000', '#ffffff', 'body');

    // Baseline WCAG 2.x
    expect(result.baseline.wcagRatio).toBe(21);
    expect(result.baseline.passesAA).toBe(true);
    expect(result.baseline.passesAAA).toBe(true);
    expect(result.baseline.legalStatus).toBe('Compliant-AAA');

    // Modern Standard WCAG 3
    expect(result.standard.level).toBe('Gold');
    expect(result.standard.absLc).toBeGreaterThanOrEqual(90);
    expect(result.standard.passesRole).toBe(true);

    // Composite Verdict
    expect(result.verdict.passesBaseline).toBe(true);
    expect(result.verdict.passesStandard).toBe(true);
    expect(result.verdict.passesBoth).toBe(true);
    expect(result.verdict.guidance).toContain('Fully compliant');
  });

  it('detects perceptual risk when pair passes WCAG 2.2 AA but fails WCAG 3 body reading threshold', async () => {
    const { auditDualStandardContrast } = await import('../src/standards-matrix');
    // #757575 on #ffffff has WCAG 4.61:1 (passes AA >= 4.5:1), but APCA |Lc| = 74.7 (< 75 Silver body floor)
    const result = auditDualStandardContrast('#757575', '#ffffff', 'body');

    expect(result.baseline.passesAA).toBe(true);
    expect(result.standard.passesRole).toBe(false); // fails body continuous reading

    expect(result.verdict.passesBaseline).toBe(true);
    expect(result.verdict.passesStandard).toBe(false);
    expect(result.verdict.passesBoth).toBe(false);
    expect(result.verdict.guidance).toContain('Perceptual risk');
  });

  it('detects critical failure when pair fails both baseline and modern standards', async () => {
    const { auditDualStandardContrast } = await import('../src/standards-matrix');
    const result = auditDualStandardContrast('#94A3B8', '#ffffff', 'body');

    expect(result.baseline.passesAA).toBe(false);
    expect(result.standard.passesRole).toBe(false);
    expect(result.verdict.passesBoth).toBe(false);
    expect(result.verdict.guidance).toContain('Critical failure');
  });
});

describe('Unified Multi-Standard Baseline & WCAG 3 Audit (auditMultiStandardBaseline)', () => {
  it('combines Axe, HTMLCS, Semantic HTML5, and WCAG 3 standard tiers into a single report', () => {
    const multiAudit = auditMultiStandardBaseline({
      name: 'Production Checkout',
      semanticSpec: {
        hasLangAttribute: true,
        hasDocumentTitle: true,
        formControlsMissingAutocomplete: [],
        buttonsMissingType: [],
        duplicateIds: [],
      },
      colorPairs: [
        { id: 'heading', fg: '#0F172A', bg: '#FFFFFF', role: 'headline' },
        { id: 'body', fg: '#1E293B', bg: '#FFFFFF', role: 'body' },
        { id: 'cta', fg: '#FFFFFF', bg: '#2563EB', role: 'control' },
      ],
    });

    expect(multiAudit.passesAllStandards).toBe(true);
    expect(multiAudit.baseline.passesLegalBaseline).toBe(true);
    expect(multiAudit.baseline.wcag2PassCount).toBe(3);
    expect(multiAudit.standardWcag3.passesPerceptualStandard).toBe(true);
    expect(multiAudit.standardWcag3.evaluatedPairs).toHaveLength(3);
    expect(multiAudit.compositeSummary.baselineGrade).toBe('AAA');
    expect(['Gold', 'Silver', 'Bronze']).toContain(multiAudit.compositeSummary.wcag3StandardTier);
    expect(multiAudit.compositeSummary.isFullyCompliant).toBe(true);
  });
});
