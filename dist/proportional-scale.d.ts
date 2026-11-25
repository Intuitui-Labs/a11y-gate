/**
 * @intuitui-labs/a11y-gate - Proportional Typographic & Spatial Scaling Engine
 *
 * Implements physically & optically proportional scaling across:
 * 1. Continuous Optical Tracking Curve (Inverse power scaling with font size)
 * 2. Continuous Optical Leading Curve (Compact headings vs spacious body)
 * 3. Proportional Word & Paragraph Spacing (WCAG 1.4.12 Text Spacing)
 * 4. Typographic-to-Container Spatial Ratios (Padding & Gaps tied to font size)
 * 5. Tiered Conformance Levels: Gold, Silver, Bronze, Fail
 * 6. Hard Legal Baseline Failures (Sub-12px, crushed leading < 1.30, negative tracking on microcopy)
 */
export type SpacingConformanceLevel = 'Gold' | 'Silver' | 'Bronze' | 'Fail';
export type ProportionalTextRole = 'display' | 'headline' | 'body' | 'caption' | 'code' | 'micro' | 'control' | 'sub_fluent' | 'spot';
export type TypographicRole = ProportionalTextRole;
export interface ProportionalTrackingBounds {
    idealEm: number;
    minEm: number;
    maxEm: number;
    idealPx: number;
}
/**
 * 1. Continuous Optical Tracking Scaling Curve
 * Letter spacing scales inversely with font size:
 * - Small microcopy (<=12px): requires wide positive tracking (+0.04em to +0.08em) to combat visual crowding.
 * - Body copy (14px - 18px): neutral or slightly open tracking (0.00em to +0.015em).
 * - Headlines (24px - 36px): slightly compact tracking (-0.01em to -0.015em).
 * - Large display (48px+): compact tracking (-0.02em to -0.03em) to keep glyphs unified.
 */
export declare function computeProportionalTracking(fontSizePx: number): ProportionalTrackingBounds;
export interface ProportionalLeadingBounds {
    idealRatio: number;
    minRatio: number;
    maxRatio: number;
    idealLineHeightPx: number;
}
/**
 * 2. Continuous Optical Leading Curve (Line-Height / Font-Size)
 * Leading scales inversely with font size and depends on role:
 * - Micro / captions: 1.60x - 1.70x (spacious leading prevents ascender/descender collision at low scale).
 * - Body text: 1.50x - 1.65x (optimal Swiss reading cadence).
 * - Headlines: 1.15x - 1.25x (compact leading prevents title fragmentation).
 * - Display / Hero: 1.08x - 1.15x (ultra-tight cohesive title blocks).
 */
export declare function computeProportionalLeading(fontSizePx: number, role?: ProportionalTextRole): ProportionalLeadingBounds;
export interface ProportionalWordSpacingBounds {
    idealPx: number;
    minPx: number;
    maxPx: number;
}
/**
 * 3. Proportional Word Spacing (WCAG 1.4.12 & Saccadic Landing Pads)
 */
export declare function computeProportionalWordSpacing(fontSizePx: number): ProportionalWordSpacingBounds;
export interface ProportionalContainerSpacingBounds {
    minPaddingPx: number;
    idealPaddingPx: number;
    maxChildGapPx: number;
    idealGutterPx: number;
}
/**
 * 4. Container Spatial Spacing Proportionate to Typography
 * Container padding and child gaps are physically tethered to the typographic scale:
 * - Inner Padding >= 1.25 * fontSize
 * - Child Gap <= 0.80 * Inner Padding (satisfying Gestalt enclosure Padding >= Gap)
 */
export declare function computeProportionalContainerSpacing(fontSizePx: number): ProportionalContainerSpacingBounds;
export interface ProportionalSpacingSpec {
    id?: string;
    fontSizePx: number;
    fontWeight?: number;
    lineHeightPx?: number;
    letterSpacingEm?: number;
    wordSpacingPx?: number;
    paragraphSpacingPx?: number;
    readingMeasureChars?: number;
    containerPaddingPx?: number;
    childGapPx?: number;
    interContainerGutterPx?: number;
    role?: ProportionalTextRole;
    isMobile?: boolean;
}
export interface ProportionalSpacingResult {
    id?: string;
    level: SpacingConformanceLevel;
    score: number;
    isHardBaselineFailure: boolean;
    hardBaselineViolations: string[];
    advisories: string[];
    metrics: {
        fontSizePx: number;
        leadingRatio: number;
        idealLeadingRatio: number;
        trackingEm: number;
        idealTrackingEm: number;
        wordSpacingRatio?: number;
        gestaltEnclosureRatio?: number;
        measureChars?: number;
    };
    remediations: string[];
}
/**
 * 5. Complete Proportional Typographic & Spatial Audit
 * Evaluates spacing against continuous optical curves and classifies into:
 * - Gold (Score >= 90): Optically perfect Swiss proportion
 * - Silver (Score >= 75): Balanced standard perceptual compliance
 * - Bronze (Score >= 60): Legal baseline floor
 * - Fail: Hard baseline failure (sub-12px, crushed leading < 1.30, negative tracking on microcopy)
 */
export declare function auditProportionalSpacing(spec: ProportionalSpacingSpec): ProportionalSpacingResult;
export type CanonicalFontScaleRole = 'micro' | 'caption' | 'body_sm' | 'body' | 'subhead' | 'h3' | 'h2' | 'h1' | 'display';
export interface TypographicRoleConstraint {
    role: CanonicalFontScaleRole;
    description: string;
    minPxDesktop: number;
    minPxMobile: number;
    defaultPx: number;
    maxPx: number;
    modularStep: number;
    minContrastLc: number;
}
export declare const TYPOGRAPHIC_ROLE_CANON: Record<CanonicalFontScaleRole, TypographicRoleConstraint>;
export type ModularScalePreset = 'major-second' | 'minor-third' | 'major-third' | 'perfect-fourth' | 'augmented-fourth' | 'golden-ratio';
export declare const MODULAR_SCALE_RATIOS: Record<ModularScalePreset, number>;
export interface ScaledRoleTypography {
    role: CanonicalFontScaleRole;
    fontSizePx: number;
    lineHeightPx: number;
    leadingRatio: number;
    letterSpacingEm: number;
    letterSpacingPx: number;
    minContrastLc: number;
}
export interface ModularScaleOptions {
    basePx?: number;
    ratio?: ModularScalePreset | number;
    isMobile?: boolean;
}
/**
 * Generate a mathematically coherent, ergonomically grounded typographic scale
 * derived from a single base font size (defaults to 16px) using geometric progression:
 * S_n = S_0 * r^n
 */
export declare function generateModularTypographicScale(options?: ModularScaleOptions): Record<CanonicalFontScaleRole, ScaledRoleTypography>;
export interface TypographicRoleAuditResult {
    passes: boolean;
    isHardFailure: boolean;
    violations: string[];
    recommendedPx: number;
}
/**
 * Validates a font size against its semantic role's ergonomic and legal constraints.
 */
export declare function auditTypographicRole(role: CanonicalFontScaleRole, fontSizePx: number, isMobile?: boolean): TypographicRoleAuditResult;
