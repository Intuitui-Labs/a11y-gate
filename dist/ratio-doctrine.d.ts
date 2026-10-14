/**
 * @intuitui-labs/a11y-gate - Pure-Ratio Psychophysical Doctrine Engine
 *
 * "Humans only see ratios, nothing else."
 *
 * Formal mathematical model of human sensory perception across:
 * 1. Psychophysics: Weber-Fechner Law (ΔI / I = k) & Stevens' Power Law (ψ = k · I^a)
 * 2. Swiss Typographic Continuum: Tschichold's Golden Canon (2:3:4:6) & Müller-Brockmann Modular Grids
 * 3. Apple Human Interface Guidelines: Non-uniform Dynamic Type power curves & ScaledMetric ratios
 * 4. APCA Lightness Contrast: Spatial-frequency dependent photoreceptor inhibition
 */
export declare const PSYCHOPHYSICAL_RATIOS: {
    readonly GESTALT_PROXIMITY_MIN: 1.5;
    readonly GESTALT_PROXIMITY_OPTIMAL: 2.5;
    readonly HEADING_CLINGING_MIN: 2;
    readonly HEADING_CLINGING_OPTIMAL: 3;
    readonly GESTALT_ENCLOSURE_MIN: 1;
    readonly SPATIAL_HIERARCHY_INEQUALITY_MIN: 0.75;
    readonly CANVAS_MARGIN_RATIO_MIN: 0.04;
    readonly CANVAS_MARGIN_RATIO_OPTIMAL: 0.06;
    readonly WHITESPACE_RATIO_MIN: 0.2;
    readonly TOUCH_TO_GLYPH_RATIO_MIN: 2.2;
    readonly TOUCH_TARGET_FLOOR_PX: 44;
    readonly OPTICAL_STEM_FLOOR_PX: 1.25;
    readonly LEADING_BODY_MIN: 1.45;
    readonly LEADING_BODY_MAX: 1.68;
    readonly LEADING_HEADING_MIN: 1.12;
    readonly LEADING_HEADING_MAX: 1.3;
    readonly TRACKING_MICRO_MIN_EM: 0.025;
    readonly TRACKING_DISPLAY_MAX_EM: 0.005;
    readonly APCA_MICRO_COPY_MIN: 70;
    readonly APCA_BODY_READING_MIN: 75;
    readonly APCA_CONTROLS_MIN: 60;
    readonly CONCENTRIC_RADIUS_TOLERANCE_PX: 2;
    readonly FOCUS_RING_STROKE_MIN_PX: 2;
    readonly FOCUS_RING_OFFSET_MIN_PX: 2;
    readonly FOCUS_TO_BORDER_RATIO_MIN: 1.5;
    readonly CANONICAL_ASPECT_RATIOS: {
        readonly SQUARE: 1;
        readonly CLASSIC_4_3: 1.333;
        readonly SILVER_RATIO: 1.414;
        readonly PHOTO_3_2: 1.5;
        readonly GOLDEN_RATIO: 1.618;
        readonly WIDESCREEN_16_9: 1.778;
    };
};
export interface DynamicTypeScaleInput {
    baseFontSizePx: number;
    scaleFactor: number;
    role: 'display' | 'title' | 'body' | 'caption';
}
/**
 * Computes non-uniform perceptual scaling based on Stevens' Power Law.
 * Headings scale sub-linearly (exponent ~0.7) to prevent layout rupture.
 * Body and captions scale super-linearly (exponent ~1.2) to safeguard low-vision readability.
 */
export declare function computeNonUniformDynamicScale(input: DynamicTypeScaleInput): {
    scaledFontSizePx: number;
    perceptualScaleRatio: number;
    exponent: number;
};
export interface OpticalStemSpec {
    fontSizePx: number;
    fontWeight: number;
    fontFamily?: string;
    isRetinaOrHighDpi?: boolean;
}
export interface OpticalStemResult {
    passes: boolean;
    estimatedStemWidthPx: number;
    stemRatio: number;
    hasSubpixelDiffractionHazard: boolean;
    violation?: string;
}
/**
 * Evaluates physical stem thickness to prevent stroke vibration and anti-aliasing collapse.
 * Standard regular weights have stem ratios of ~0.10. Bold weights have ~0.18 - 0.22.
 */
export declare function auditOpticalStemThickness(spec: OpticalStemSpec): OpticalStemResult;
export interface PsychophysicalRatioAuditInput {
    viewportWidthPx: number;
    viewportHeightPx: number;
    canvasMarginHorizontalPx: number;
    contentWidthPx: number;
    readingMeasureChars?: number;
    interContainerGutterPx: number;
    intraContainerPaddingPx: number;
    labelToInputGapPx?: number;
    inputToNextGroupGapPx?: number;
    headingMarginTopPx?: number;
    headingMarginBottomPx?: number;
    fontSizePx: number;
    fontWeight: number;
    lineHeightPx?: number;
    letterSpacingEm?: number;
    colorHex?: string;
    bgHex?: string;
    role: 'display' | 'title' | 'body' | 'micro' | 'control';
    touchHitDimensionPx?: number;
    visualGlyphDimensionPx?: number;
}
export interface PsychophysicalRatioAuditResult {
    passes: boolean;
    score: number;
    ratios: {
        canvasMarginRatio: number;
        whitespaceRatio: number;
        spatialHierarchyRatio: number;
        gestaltProximityRatio?: number;
        headingClingingRatio?: number;
        leadingRatio?: number;
        touchToGlyphRatio?: number;
        apcaContrastLc?: number;
    };
    violations: string[];
    recommendations: string[];
}
export declare function auditPsychophysicalRatios(input: PsychophysicalRatioAuditInput): PsychophysicalRatioAuditResult;
export interface ConcentricRadiusSpec {
    outerRadiusPx: number;
    innerRadiusPx: number;
    paddingPx: number;
    tolerancePx?: number;
}
export interface ConcentricRadiusResult {
    passes: boolean;
    idealInnerRadiusPx: number;
    deltaPx: number;
    violation?: string;
}
/**
 * Concentricity Canon: Nested rounded rectangles must share the same geometric curvature center.
 * R_inner = max(0, R_outer - Padding).
 * Deviations cause optical buckling, uneven border strokes, and distorted corners.
 */
export declare function auditConcentricCornerRadius(spec: ConcentricRadiusSpec): ConcentricRadiusResult;
export interface FocusRingSpec {
    focusRingStrokePx: number;
    focusOffsetGapPx: number;
    elementBorderPx?: number;
}
export interface FocusRingResult {
    passes: boolean;
    strokeRatio: number;
    violation?: string;
}
/**
 * Evaluates focus ring geometry to ensure keyboard focus is unmistakable and un-occluded.
 */
export declare function auditFocusRingRatio(spec: FocusRingSpec): FocusRingResult;
export interface HarmonicAspectRatioSpec {
    widthPx: number;
    heightPx: number;
    tolerance?: number;
}
export interface HarmonicAspectRatioResult {
    passes: boolean;
    aspectRatio: number;
    nearestCanonicalName?: string;
    nearestCanonicalRatio?: number;
    deviation: number;
    recommendation?: string;
}
/**
 * Validates container dimensions against classical and Swiss harmonic aspect ratios
 * (Square 1:1, Classic 4:3, Silver 1:√2, 3:2 Photo, Golden φ, 16:9 Widescreen).
 */
export declare function auditHarmonicAspectRatio(spec: HarmonicAspectRatioSpec): HarmonicAspectRatioResult;
export declare function auditChromostereopsisHazard(colorHex1: string, colorHex2: string): {
    hasHazard: boolean;
    violation?: string;
};
