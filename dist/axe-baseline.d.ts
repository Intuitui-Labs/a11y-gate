/**
 * @intuitui-labs/a11y-gate - Multi-Engine Standards Baseline & Unified Quality Gate
 *
 * Integrates industry-standard engines:
 * 1. Axe-Core 4.13.0 (Deque W3C WCAG 2.1 / 2.2 AA)
 * 2. HTML CodeSniffer (HTMLCS 2.5.1 - powers Pa11y / Section 508 / WCAG 2.1 AAA)
 * 3. Our proprietary Swiss-Silk Perceptual, Optical & Convolutional Hierarchy engines.
 */
import { SwissSilkAuditSpec, SwissSilkAuditResult } from './swiss-silk.js';
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
export declare function evaluateAxeBaseline(results: AxeResultsLike): AxeBaselineAuditResult;
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
export declare function auditUnifiedPlatform(spec: UnifiedAuditSpec): UnifiedAuditResult;
