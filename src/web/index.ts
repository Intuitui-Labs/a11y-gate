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
  remBasePx?: number; // default 16
}

/**
 * Generate CSS custom property declarations for fluid clamp tokens.
 */
export function generateFluidTokenVars(tokens: Record<string, { min: number; max: number }>, minViewport = 320, maxViewport = 1280): string {
  const lines: string[] = [':root {'];
  for (const [name, bounds] of Object.entries(tokens)) {
    const minRem = bounds.min / 16;
    const maxRem = bounds.max / 16;
    const slope = (bounds.max - bounds.min) / (maxViewport - minViewport);
    const yIntersect = -minViewport * slope + bounds.min;
    const yIntersectRem = Math.round((yIntersect / 16) * 10000) / 10000;
    const slopeVw = Math.round(slope * 100 * 10000) / 10000;
    lines.push(`  --step-${name}: clamp(${minRem.toFixed(4)}rem, ${yIntersectRem}rem + ${slopeVw}vw, ${maxRem.toFixed(4)}rem);`);
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate standard web safe-area CSS rules for full-bleed mobile web.
 */
export function generateSafeAreaCssRules(): string {
  return `:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
}

.safe-area-pad {
  padding-top: var(--safe-area-top);
  padding-bottom: var(--safe-area-bottom);
  padding-left: var(--safe-area-left);
  padding-right: var(--safe-area-right);
}`;
}
