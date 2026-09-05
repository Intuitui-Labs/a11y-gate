/**
 * @intuitui-labs/a11y-gate - Mobile Visual Architecture & Touch Ergonomics Audit Engine
 *
 * Provides automated audits for:
 * 1. Touch Target Geometry (WCAG 2.2 AAA SC 2.5.5 / Android 48dp / Apple 44pt)
 * 2. 320px Intrinsic Responsive Reflow (WCAG 2.2 AA SC 1.4.10)
 * 3. Safe Area Inset Defensiveness (iOS notch / Dynamic Island / Android gesture bars)
 * 4. Mobile Typography Floor & Dynamic Type Tolerance (14px micro floor, text-wrap balance)
 * 5. Mobile Menu & Drawer Semantics (VoiceOver & TalkBack screen reader states)
 * 6. React Native / Mobile Component & Screen Qualitative & Ergonomic Audits:
 *    - Step 0: Qualitative UX Gate (Friction, cognitive load, desktop-era checkboxes, blocking modals)
 *    - Step 1: Qualitative Visual Gate (Spatial hierarchy, nested card clutter, typography floor)
 *    - Step 2: Quantitative Ergonomics Gate (48dp touch areas, hitSlop defense, accessibilityRole)
 */
export interface MobileAuditConfig {
    name: string;
    htmlPages: {
        path: string;
        html: string;
    }[];
    cssContent?: string;
    strictTargetSizePx?: number;
    minimumMicroPx?: number;
}
export interface TouchTargetAuditResult {
    totalInteractive: number;
    compliantCount: number;
    nonCompliantTags: string[];
    isCompliant: boolean;
}
export interface ReflowAuditResult {
    passes320Reflow: boolean;
    fixedWidthViolations: string[];
}
export interface SafeAreaAuditResult {
    hasViewportFitCover: boolean;
    hasSafeAreaInsets: boolean;
}
export interface TypographyAuditResult {
    passes14PxFloor: boolean;
    sub14PxViolations: string[];
}
export interface MenuSemanticsAuditResult {
    hasMenuToggle: boolean;
    hasExpandedAttribute: boolean;
    hasDialogRole: boolean;
    hasModalAttribute: boolean;
}
/**
 * 1. Audits touch target sizes across interactive elements (<a>, <button>, <input>, <select>)
 */
export declare function auditTouchTargetGeometry(html: string, minSizePx?: number): TouchTargetAuditResult;
/**
 * 2. Audits that layout does not impose hardcoded pixel widths > 320px forcing horizontal scrolling
 */
export declare function auditResponsiveIntrinsicLayout(html: string, css?: string): ReflowAuditResult;
/**
 * 3. Audits viewport-fit=cover and defensive safe area inset usage
 */
export declare function auditSafeAreaDefensiveness(html: string, css?: string): SafeAreaAuditResult;
/**
 * 4. Audits that mobile typography satisfies the strict 14px floor
 */
export declare function auditMobileTypographyFloor(html: string): TypographyAuditResult;
/**
 * 5. Audits mobile menu toggle and drawer dialog accessibility semantics
 */
export declare function auditMobileMenuSemantics(html: string): MenuSemanticsAuditResult;
/**
 * Universal Mobile A11y & Touch Ergonomics Test Runner for HTML/Web
 */
export declare function runMobileAuditSuite(config: MobileAuditConfig, testHooks: {
    describe: Function;
    it: Function;
    expect: Function;
}): void;
export type AuditGateStage = 'step0_qualitative_ux' | 'step1_qualitative_visual' | 'step2_quantitative_ergonomics';
export interface ReactNativeScreenFinding {
    rule: string;
    gate: AuditGateStage;
    severity: 'error' | 'warning';
    message: string;
    occurrences: string[];
}
export interface ReactNativeScreenAuditResult {
    screenName: string;
    isCompliant: boolean;
    hasErrors: boolean;
    findings: ReactNativeScreenFinding[];
    summary: {
        errors: number;
        warnings: number;
    };
}
/**
 * Audits React Native component source code for typography floor violations (< 14px).
 */
export declare function auditReactNativeTypography(sourceCode: string): ReactNativeScreenFinding | null;
/**
 * Audits interactive elements (Pressable, TouchableOpacity) for sub-48dp touch targets lacking hitSlop.
 */
export declare function auditReactNativeTouchTargets(sourceCode: string): ReactNativeScreenFinding | null;
/**
 * Audits Step 0 Qualitative UX patterns:
 * - Detects mandatory desktop-era checkboxes blocking exploration.
 * - Detects excessive nested card containers ("box-in-a-box").
 */
export declare function auditReactNativeQualitativeUx(sourceCode: string): ReactNativeScreenFinding[];
/**
 * Unified audit function for any React Native screen or component.
 */
export declare function auditReactNativeScreen(sourceCode: string, screenName?: string): ReactNativeScreenAuditResult;
/**
 * Universal React Native Screen Audit Test Suite for Vitest / Jest
 */
export declare function runReactNativeScreenAuditSuite(screens: {
    name: string;
    sourceCode: string;
}[], testHooks: {
    describe: Function;
    it: Function;
    expect: Function;
}): void;
