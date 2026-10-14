/**
 * @intuitui-labs/a11y-gate/web - Tree-Shakable Web Accessibility & Responsive Infrastructure
 *
 * Provides pure utilities for:
 * 1. Utopia Fluid Typography & Spacing Clamps (`clamp(min, val, max)`)
 * 2. Web Safe Area & Viewport-Fit Defensiveness
 * 3. Media Query Reduced Motion CSS & Observers
 * 4. DOM & HTML Element Auditing
 * 5. Spatial Grid & Reading Measure Bounds (45ch-75ch)
 */
export * from '../spatial-math.js';
export * from '../platform-audit.js';
export * from '../motion-tactile.js';
export interface WebViewportConfig {
    minWidthPx: number;
    maxWidthPx: number;
    minSizePx: number;
    maxSizePx: number;
    remBasePx?: number;
}
/**
 * Generate CSS custom property declarations for fluid clamp tokens.
 */
export declare function generateFluidTokenVars(tokens: Record<string, {
    min: number;
    max: number;
}>, minViewport?: number, maxViewport?: number): string;
/**
 * Generate standard web safe-area CSS rules for full-bleed mobile web.
 */
export declare function generateSafeAreaCssRules(): string;
