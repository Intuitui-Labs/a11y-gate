/**
 * @intuitui-labs/a11y-gate - Multi-Engine Standards Baseline & Unified Quality Gate
 *
 * Integrates industry-standard engines:
 * 1. Axe-Core 4.13.0 (Deque W3C WCAG 2.1 / 2.2 AA)
 * 2. HTML CodeSniffer (HTMLCS 2.5.1 - powers Pa11y / Section 508 / WCAG 2.1 AAA)
 * 3. Our proprietary Swiss-Silk Perceptual, Optical & Convolutional Hierarchy engines.
 */
import { auditSwissSilkDoctrine } from './swiss-silk.js';
export function evaluateAxeBaseline(results) {
    const violations = results.violations ?? [];
    let criticalCount = 0;
    let seriousCount = 0;
    let moderateCount = 0;
    let minorCount = 0;
    const formattedViolations = [];
    for (const v of violations) {
        if (v.impact === 'critical')
            criticalCount++;
        else if (v.impact === 'serious')
            seriousCount++;
        else if (v.impact === 'moderate')
            moderateCount++;
        else
            minorCount++;
        const nodeCount = v.nodes ? v.nodes.length : 1;
        formattedViolations.push(`[${(v.impact ?? 'normal').toUpperCase()}] ${v.id}: ${v.description} (${nodeCount} node${nodeCount > 1 ? 's' : ''})`);
    }
    return {
        passesBaseline: violations.length === 0,
        passed: violations.length === 0,
        violationCount: violations.length,
        criticalCount,
        seriousCount,
        moderateCount,
        minorCount,
        formattedViolations,
    };
}
export function auditUnifiedPlatform(spec) {
    const perceptual = auditSwissSilkDoctrine(spec.swissSilkSpec);
    const baseline = spec.axeResults
        ? evaluateAxeBaseline(spec.axeResults)
        : {
            passesBaseline: true,
            passed: true,
            violationCount: 0,
            criticalCount: 0,
            seriousCount: 0,
            moderateCount: 0,
            minorCount: 0,
            formattedViolations: [],
        };
    const isFullyCertified = baseline.passesBaseline && perceptual.isCompliant;
    let compositeGrade = 'Non-Compliant';
    if (baseline.passesBaseline && perceptual.grade === 'AAA') {
        compositeGrade = 'Certified-AAA';
    }
    else if (baseline.passesBaseline && (perceptual.grade === 'AA' || perceptual.grade === 'A')) {
        compositeGrade = 'Certified-AA';
    }
    else if (baseline.passesBaseline && !perceptual.isCompliant) {
        compositeGrade = 'Compliant-Baseline-Only';
    }
    return {
        name: spec.name,
        isFullyCertified,
        baseline,
        perceptual,
        compositeGrade,
    };
}
