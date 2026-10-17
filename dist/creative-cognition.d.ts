/**
 * @intuitui-labs/a11y-gate - Creative Cognitive Perception & Spatial Ergonomics Engine
 *
 * Cutting-edge perceptual features:
 * 1. Visual Saliency & CTA Dominance Index (Human Gaze Simulation)
 * 2. Cognitive Load & Visual Entropy Index (Shannon Information Entropy)
 * 3. Mobile Thumb Reachability Polar Coordinates (Hoober-Wroblewski Ergonomic Arc)
 * 4. CVD Dual-Encoding Matrix (Colorblind Non-Reliance Verification)
 */
export interface InteractiveVisualTarget {
    id: string;
    text: string;
    isPrimaryCta: boolean;
    widthPx: number;
    heightPx: number;
    centerXPx: number;
    centerYPx: number;
    absLc: number;
    fontWeight: number;
    isDecorative?: boolean;
}
export interface VisualSaliencyResult {
    passes: boolean;
    ctaDominanceIndex: number;
    primaryCtaSaliency: number;
    maxDistractorSaliency: number;
    distractorId?: string;
    violations: string[];
}
/**
 * 1. Human Visual Gaze Saliency Simulation (Itti-Koch heuristic approximation)
 * Computes whether the primary call to action has the highest visual energy in the viewport.
 */
export declare function evaluateVisualSaliency(targets: InteractiveVisualTarget[]): VisualSaliencyResult;
export type CtaDominanceResult = VisualSaliencyResult;
export declare const evaluateCtaVisualDominance: typeof evaluateVisualSaliency;
export interface ViewportEntropySpec {
    viewportWidthPx: number;
    viewportHeightPx: number;
    distinctColorCount: number;
    distinctFontCount: number;
    distinctBorderRadiiCount: number;
    elementCount: number;
}
export interface CognitiveEntropyResult {
    passes: boolean;
    shannonEntropyScore: number;
    cognitiveLoadGrade: 'Tranquil-Silk' | 'Balanced-Calm' | 'Dense-Complex' | 'Cognitive-Overload';
    violations: string[];
}
/**
 * 2. Cognitive Load & Visual Shannon Entropy Index
 * Measures information disorder across color, typography, geometry, and density.
 */
export declare function evaluateCognitiveEntropy(spec: ViewportEntropySpec): CognitiveEntropyResult;
export interface MobileThumbTarget {
    id: string;
    name: string;
    centerXPx: number;
    centerYPx: number;
    isPrimaryAction: boolean;
    viewportWidthPx: number;
    viewportHeightPx: number;
}
export interface ThumbZoneErgonomicsResult {
    passes: boolean;
    primaryZone: 'Natural-Sweep' | 'Comfortable-Reach' | 'Pain-Zone-Two-Hand';
    polarDistancePx: number;
    violations: string[];
}
/**
 * 3. Mobile Thumb Reachability Polar Coordinates (Hoober-Wroblewski Model)
 * Origin: Bottom-Right thumb pivot (x = viewportWidth * 0.9, y = viewportHeight * 0.95)
 */
export declare function evaluateThumbZoneErgonomics(target: MobileThumbTarget): ThumbZoneErgonomicsResult;
export declare const evaluatePolarThumbArc: typeof evaluateThumbZoneErgonomics;
export interface CvdStateSpec {
    id: string;
    state: 'active' | 'selected' | 'error' | 'disabled';
    hasIconIndicator: boolean;
    hasTextLabel: boolean;
    colorOnly: boolean;
}
export interface CvdDualEncodingResult {
    passes: boolean;
    violations: string[];
}
/**
 * 4. Colorblind Dual-Encoding Verification
 * Ensures state is NEVER conveyed purely by color alone (WCAG 1.4.1).
 */
export declare function auditCvdDualEncoding(states: CvdStateSpec[]): CvdDualEncodingResult;
