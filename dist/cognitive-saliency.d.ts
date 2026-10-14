/**
 * @intuitui-labs/a11y-gate - Cognitive Saliency, Visual Entropy & Polar Thumb-Reach Engine
 *
 * Visionary UX & Cognitive Perception Mathematics:
 * 1. Saccadic Eye-Tracking Saliency Map & Attention Ratio:
 *    - Computes optical visual salience: Area * (Weight/400) * Contrast * PositionMultiplier
 *    - Rejects interfaces where decorative technical noise (coordinates, stamps, borders)
 *      has higher visual salience than the primary user action (Attention Hijack).
 *
 * 2. Visual Shannon Entropy (Cognitive Clutter Index):
 *    - Computes information entropy: H = -sum(p_i * log2(p_i)) over typography, colors, and borders
 *    - Flags visual cacophony (> 4.0 bits) vs silk-like tranquility (<= 2.5 bits).
 *
 * 3. Polar Thumb-Zone Reachability Engine:
 *    - Calculates physical thumb reach distance: d = sqrt((x - pivotX)^2 + (y - pivotY)^2)
 *    - Zones: Natural (<= 240px from bottom), Stretch (240 - 450px), Friction (> 450px).
 *    - Enforces primary actions in Natural Zone on mobile viewports.
 */
export interface SaliencyElementSpec {
    id: string;
    role: 'primary-action' | 'secondary-action' | 'input' | 'heading' | 'decorative' | 'body';
    widthPx: number;
    heightPx: number;
    fontWeight: number;
    absLc: number;
    viewportYPx: number;
}
export interface VisualSaliencyResult {
    passes: boolean;
    primaryActionSaliency: number;
    maxDecorativeSaliency: number;
    attentionRatio: number;
    violations: string[];
}
export declare function evaluateVisualSaliency(elements: SaliencyElementSpec[]): VisualSaliencyResult;
export interface VisualEntropyConfig {
    uniqueFontSizes: number[];
    uniqueFontWeights: number[];
    uniqueColors: string[];
    uniqueBorderStyles: string[];
}
export interface VisualEntropyResult {
    passes: boolean;
    entropyBits: number;
    clutterLevel: 'Tranquil / Silk' | 'Balanced' | 'High Clutter' | 'Sensory Overload';
    violations: string[];
}
export declare function evaluateVisualEntropy(config: VisualEntropyConfig): VisualEntropyResult;
export interface TouchPointSpec {
    id: string;
    role: 'primary-action' | 'navigation' | 'input' | 'optional-chip';
    xPx: number;
    yPx: number;
}
export interface ThumbZoneConfig {
    viewportWidthPx: number;
    viewportHeightPx: number;
    touchPoints: TouchPointSpec[];
    handedness?: 'right' | 'left' | 'ambidextrous';
}
export interface ThumbZoneResult {
    passes: boolean;
    primaryActionZone: 'Natural' | 'Stretch' | 'Friction';
    distanceToThumbPx: number;
    violations: string[];
}
export declare function evaluateThumbZoneErgonomics(config: ThumbZoneConfig): ThumbZoneResult;
