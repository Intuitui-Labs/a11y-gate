/**
 * @intuitui-labs/a11y-gate - Multi-Standard Accessibility Matrix
 *
 * Combines industry-standard engines into a unified baseline:
 * 1. Deque Axe-Core (WCAG 2.1/2.2 AA low-false-positive engine)
 * 2. HTML CodeSniffer (HTMLCS / Pa11y: WCAG 2.1 AAA & Section 508)
 * 3. W3C Semantic HTML5 & Autocomplete Token Safety (SC 1.3.5)
 */
import { evaluateAxeBaseline } from './axe-baseline.js';
import { evaluateWcag } from './contrast-math.js';
import { evaluateWcag3, } from './wcag3.js';
export function evaluateHtmlCsBaseline(messages) {
    const errors = messages.filter(m => m.type === 'error');
    const warnings = messages.filter(m => m.type === 'warning');
    const contrastErrors = [];
    const structureErrors = [];
    const allErrors = [];
    for (const err of errors) {
        const desc = `[${err.code}] ${err.msg}`;
        allErrors.push(desc);
        if (err.code.includes('1_4_6') || err.code.includes('Contrast')) {
            contrastErrors.push(desc);
        }
        else {
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
export function evaluateSemanticHtml5(spec) {
    const violations = [];
    if (!spec.hasLangAttribute) {
        violations.push('<html> element is missing a valid [lang] attribute (WCAG 3.1.1).');
    }
    if (!spec.hasDocumentTitle) {
        violations.push('Document is missing a descriptive <title> tag (WCAG 2.4.2).');
    }
    if (spec.formControlsMissingAutocomplete.length > 0) {
        violations.push(`Personal data inputs missing autocomplete tokens: ${spec.formControlsMissingAutocomplete.join(', ')} (WCAG 2.1 SC 1.3.5 AAA).`);
    }
    if (spec.buttonsMissingType.length > 0) {
        violations.push(`<button> elements missing explicit type="button|submit|reset": ${spec.buttonsMissingType.length} elements.`);
    }
    if (spec.duplicateIds.length > 0) {
        violations.push(`Duplicate DOM IDs detected: ${spec.duplicateIds.join(', ')} (violates HTML5 specification).`);
    }
    return {
        passes: violations.length === 0,
        violations,
    };
}
/**
 * Standard Dual-Engine Contrast Evaluator:
 * Simultaneously benchmarks against the legal enforceable baseline (WCAG 2.1/2.2 AA & AAA)
 * and the modern perceptual standard (WCAG 3 APCA 0.98G Candidate Model).
 */
export function auditDualStandardContrast(fg, bg, role = 'body') {
    const wcag = evaluateWcag(fg, bg);
    const wcag3 = evaluateWcag3(fg, bg);
    const passesAA = role === 'headline'
        ? wcag.passesAaLarge
        : role === 'control' || role === 'icon_graphic'
            ? wcag.passesUiComponent
            : wcag.passesAaNormal;
    const passesAAA = role === 'headline'
        ? wcag.passesAaaLarge
        : role === 'control' || role === 'icon_graphic'
            ? wcag.passesAaLarge
            : wcag.passesAaaNormal;
    let legalStatus = 'Non-Compliant';
    if (passesAAA)
        legalStatus = 'Compliant-AAA';
    else if (passesAA)
        legalStatus = 'Compliant-AA';
    const passesStandard = wcag3.passesRole[role];
    const passesBaseline = passesAA;
    const passesBoth = passesBaseline && passesStandard;
    let guidance = '';
    if (passesBoth) {
        guidance = `Fully compliant: Satisfies WCAG 2.2 ${legalStatus} legal baseline (${wcag.ratio}:1) and meets WCAG 3 ${wcag3.level} perceptual standard (|Lc| ${wcag3.absScore}) for ${role}.`;
    }
    else if (passesBaseline && !passesStandard) {
        guidance = `Perceptual risk: Satisfies WCAG 2.2 legal baseline (${wcag.ratio}:1), but fails WCAG 3 ${wcag3.level} perceptual standard (|Lc| ${wcag3.absScore} for ${role}). High risk of eyestrain/fatigue in production.`;
    }
    else if (!passesBaseline && passesStandard) {
        guidance = `Regulatory risk: Meets WCAG 3 perceptual contrast (|Lc| ${wcag3.absScore}), but fails WCAG 2.2 ${legalStatus} legal requirement (${wcag.ratio}:1 < ${passesAA ? 3.0 : 4.5}:1). Needs elevation to satisfy legal mandates.`;
    }
    else {
        guidance = `Critical failure: Fails both WCAG 2.2 legal baseline (${wcag.ratio}:1) and WCAG 3 perceptual standard (|Lc| ${wcag3.absScore}).`;
    }
    return {
        fg,
        bg,
        role,
        baseline: {
            wcagRatio: wcag.ratio,
            passesAA,
            passesAAA,
            passesUiComponent: wcag.passesUiComponent,
            legalStatus,
        },
        standard: {
            wcag3Score: wcag3.score,
            absLc: wcag3.absScore,
            polarity: wcag3.polarity,
            level: wcag3.level,
            passesRole: passesStandard,
            ratingText: wcag3.ratingText,
            minFontMatrix: wcag3.minFontMatrix,
        },
        verdict: {
            passesBaseline,
            passesStandard,
            passesBoth,
            guidance,
        },
    };
}
export function auditMultiStandardBaseline(spec) {
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
    // Evaluate WCAG 3 and Baseline Color Pairs if provided
    const evaluatedPairs = [];
    const conformanceTiers = {
        Gold: 0,
        Silver: 0,
        Bronze: 0,
        Component: 0,
        Fail: 0,
    };
    let wcag2PassCount = 0;
    let wcag2FailCount = 0;
    let wcag3PassCount = 0;
    let wcag3FailCount = 0;
    if (spec.colorPairs && spec.colorPairs.length > 0) {
        for (const pair of spec.colorPairs) {
            const dualResult = auditDualStandardContrast(pair.fg, pair.bg, pair.role ?? 'body');
            evaluatedPairs.push(dualResult);
            conformanceTiers[dualResult.standard.level]++;
            if (dualResult.verdict.passesBaseline)
                wcag2PassCount++;
            else
                wcag2FailCount++;
            if (dualResult.verdict.passesStandard)
                wcag3PassCount++;
            else
                wcag3FailCount++;
        }
    }
    const baselineViolations = axe.violationCount +
        (htmlcs?.errorCount ?? 0) +
        (semantic?.violations.length ?? 0) +
        wcag2FailCount;
    const passesLegalBaseline = baselineViolations === 0;
    const passesPerceptualStandard = wcag3FailCount === 0;
    const passesAllStandards = passesLegalBaseline && passesPerceptualStandard;
    let baselineGrade = 'Fail';
    if (passesLegalBaseline) {
        const hasHtmlCsContrastErrors = htmlcs ? htmlcs.contrastErrors.length > 0 : false;
        const allWcagAaa = evaluatedPairs.length > 0 ? evaluatedPairs.every(p => p.baseline.passesAAA) : true;
        baselineGrade = !hasHtmlCsContrastErrors && allWcagAaa ? 'AAA' : 'AA';
    }
    let wcag3StandardTier = 'Gold';
    if (conformanceTiers.Fail > 0)
        wcag3StandardTier = 'Fail';
    else if (conformanceTiers.Component > 0)
        wcag3StandardTier = 'Component';
    else if (conformanceTiers.Bronze > 0)
        wcag3StandardTier = 'Bronze';
    else if (conformanceTiers.Silver > 0)
        wcag3StandardTier = 'Silver';
    else if (evaluatedPairs.length === 0)
        wcag3StandardTier = 'Gold';
    const summaryText = passesAllStandards
        ? `All standards satisfied. Legal Baseline Grade: ${baselineGrade}. Modern WCAG 3 Standard Tier: ${wcag3StandardTier}.`
        : `Standards violation detected. Legal Baseline: ${baselineGrade} (${baselineViolations} issues). Modern WCAG 3: ${wcag3StandardTier}.`;
    return {
        name: spec.name,
        passesAllStandards,
        axe,
        htmlcs,
        semantic,
        baseline: {
            passesLegalBaseline,
            axe,
            htmlcs,
            semantic,
            wcag2PassCount,
            wcag2FailCount,
        },
        standardWcag3: {
            passesPerceptualStandard,
            evaluatedPairs,
            conformanceTiers,
        },
        compositeSummary: {
            totalViolations: baselineViolations + wcag3FailCount,
            grade: baselineGrade,
            baselineGrade,
            wcag3StandardTier,
            isFullyCompliant: passesAllStandards,
            summaryText,
        },
    };
}
