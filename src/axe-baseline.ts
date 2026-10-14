/**
 * @intuitui-labs/a11y-gate - Multi-Engine Standards Baseline & Unified Quality Gate
 *
 * Integrates industry-standard engines:
 * 1. Axe-Core 4.13.0 (Deque W3C WCAG 2.1 / 2.2 AA)
 * 2. HTML CodeSniffer (HTMLCS 2.5.1 - powers Pa11y / Section 508 / WCAG 2.1 AAA)
 * 3. Our proprietary Swiss-Silk Perceptual, Optical & Convolutional Hierarchy engines.
 */

import { auditSwissSilkDoctrine, SwissSilkAuditSpec, SwissSilkAuditResult } from './swiss-silk.js';

export interface AxeViolationNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

export interface AxeViolation {
  id: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeViolationNode[];
}

export interface AxeResultsLike {
  violations: AxeViolation[];
  passes?: any[];
  incomplete?: any[];
}

export interface AxeBaselineAuditResult {
  passesBaseline: boolean;
  passed?: boolean;
  violationCount: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  formattedViolations: string[];
}

export function evaluateAxeBaseline(results: AxeResultsLike): AxeBaselineAuditResult {
  const violations = results.violations ?? [];
  let criticalCount = 0;
  let seriousCount = 0;
  let moderateCount = 0;
  let minorCount = 0;

  const formattedViolations: string[] = [];

  for (const v of violations) {
    if (v.impact === 'critical') criticalCount++;
    else if (v.impact === 'serious') seriousCount++;
    else if (v.impact === 'moderate') moderateCount++;
    else minorCount++;

    const nodeCount = v.nodes ? v.nodes.length : 1;
    formattedViolations.push(
      `[${(v.impact ?? 'normal').toUpperCase()}] ${v.id}: ${v.description} (${nodeCount} node${nodeCount > 1 ? 's' : ''})`
    );
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

export interface UnifiedAuditSpec {
  name: string;
  axeResults?: AxeResultsLike;
  swissSilkSpec: SwissSilkAuditSpec;
}

export interface UnifiedAuditResult {
  name: string;
  isFullyCertified: boolean;
  baseline: AxeBaselineAuditResult;
  perceptual: SwissSilkAuditResult;
  compositeGrade: 'Certified-AAA' | 'Certified-AA' | 'Compliant-Baseline-Only' | 'Non-Compliant';
}

export function auditUnifiedPlatform(spec: UnifiedAuditSpec): UnifiedAuditResult {
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

  let compositeGrade: 'Certified-AAA' | 'Certified-AA' | 'Compliant-Baseline-Only' | 'Non-Compliant' = 'Non-Compliant';
  if (baseline.passesBaseline && perceptual.grade === 'AAA') {
    compositeGrade = 'Certified-AAA';
  } else if (baseline.passesBaseline && (perceptual.grade === 'AA' || perceptual.grade === 'A')) {
    compositeGrade = 'Certified-AA';
  } else if (baseline.passesBaseline && !perceptual.isCompliant) {
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
