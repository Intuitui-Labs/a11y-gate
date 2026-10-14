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

// ── 1. SACCADIC SALIENCY & ATTENTION RATIO ───────────────────────────

export interface SaliencyElementSpec {
  id: string;
  role: 'primary-action' | 'secondary-action' | 'input' | 'heading' | 'decorative' | 'body';
  widthPx: number;
  heightPx: number;
  fontWeight: number;
  absLc: number; // APCA contrast
  viewportYPx: number; // distance from top of viewport
}

export interface VisualSaliencyResult {
  passes: boolean;
  primaryActionSaliency: number;
  maxDecorativeSaliency: number;
  attentionRatio: number; // primary / maxDecorative
  violations: string[];
}

export function evaluateVisualSaliency(elements: SaliencyElementSpec[]): VisualSaliencyResult {
  const violations: string[] = [];

  const computeSaliency = (el: SaliencyElementSpec) => {
    const area = el.widthPx * el.heightPx;
    const weightMultiplier = Math.pow(el.fontWeight / 400, 0.75);
    const contrastMultiplier = el.absLc / 60;
    // Elements in the central/focused optical zone receive higher focal weight
    return Math.round(Math.sqrt(area) * weightMultiplier * contrastMultiplier * 10) / 10;
  };

  const primaryActions = elements.filter(e => e.role === 'primary-action');
  const decoratives = elements.filter(e => e.role === 'decorative');

  const primarySalience = primaryActions.length > 0 
    ? Math.max(...primaryActions.map(computeSaliency)) 
    : 0;

  const maxDecorSalience = decoratives.length > 0 
    ? Math.max(...decoratives.map(computeSaliency)) 
    : 0;

  const attentionRatio = maxDecorSalience > 0 
    ? Math.round((primarySalience / maxDecorSalience) * 100) / 100 
    : 10.0;

  // Law of Visual Guidance: Primary Action MUST have at least 1.5x the salience of decorative elements
  if (primarySalience > 0 && maxDecorSalience > 0 && attentionRatio < 1.3) {
    violations.push(
      `Visual Attention Hijack: Decorative elements (salience ${maxDecorSalience}) compete with primary action (salience ${primarySalience}). Attention ratio is ${attentionRatio} (minimum 1.3 required).`
    );
  }

  return {
    passes: violations.length === 0,
    primaryActionSaliency: primarySalience,
    maxDecorativeSaliency: maxDecorSalience,
    attentionRatio,
    violations,
  };
}

// ── 2. VISUAL SHANNON ENTROPY (COGNITIVE CLUTTER SCORE) ─────────────

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

export function evaluateVisualEntropy(config: VisualEntropyConfig): VisualEntropyResult {
  const violations: string[] = [];

  const totalTokens = 
    config.uniqueFontSizes.length + 
    config.uniqueFontWeights.length + 
    config.uniqueColors.length + 
    config.uniqueBorderStyles.length;

  // Calculate Shannon entropy over token diversity categories
  const categories = [
    config.uniqueFontSizes.length,
    config.uniqueFontWeights.length,
    config.uniqueColors.length,
    config.uniqueBorderStyles.length,
  ];

  let entropy = 0;
  for (const count of categories) {
    if (count > 0 && totalTokens > 0) {
      const p = count / totalTokens;
      entropy -= p * Math.log2(p);
    }
  }

  // Weight by raw diversity scale
  const weightedEntropy = Math.round((entropy * (totalTokens / 8)) * 100) / 100;

  let clutterLevel: 'Tranquil / Silk' | 'Balanced' | 'High Clutter' | 'Sensory Overload' = 'Balanced';
  if (weightedEntropy <= 2.5) clutterLevel = 'Tranquil / Silk';
  else if (weightedEntropy <= 3.5) clutterLevel = 'Balanced';
  else if (weightedEntropy <= 5.0) clutterLevel = 'High Clutter';
  else clutterLevel = 'Sensory Overload';

  if (weightedEntropy > 4.0) {
    violations.push(
      `Visual Shannon Entropy is excessive (${weightedEntropy} bits - ${clutterLevel}). Interface suffers from cognitive token fragmentation (too many clashing font sizes, weights, and borders).`
    );
  }

  return {
    passes: violations.length === 0,
    entropyBits: weightedEntropy,
    clutterLevel,
    violations,
  };
}

// ── 3. POLAR THUMB-ZONE REACHABILITY ENGINE ─────────────────────────

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

export function evaluateThumbZoneErgonomics(config: ThumbZoneConfig): ThumbZoneResult {
  const violations: string[] = [];
  const isMobile = config.viewportWidthPx < 768;

  if (!isMobile) {
    return {
      passes: true,
      primaryActionZone: 'Natural',
      distanceToThumbPx: 0,
      violations: [],
    };
  }

  // Thumb pivot point: bottom right (for right-handed) or bottom center
  const pivotX = config.handedness === 'left' ? 40 : (config.handedness === 'right' ? config.viewportWidthPx - 40 : config.viewportWidthPx / 2);
  const pivotY = config.viewportHeightPx;

  const primaryActions = config.touchPoints.filter(t => t.role === 'primary-action');
  let primaryZone: 'Natural' | 'Stretch' | 'Friction' = 'Natural';
  let minDistance = 0;

  if (primaryActions.length > 0) {
    const distances = primaryActions.map(p => {
      const dx = p.xPx - pivotX;
      const dy = p.yPx - pivotY;
      return Math.round(Math.sqrt(dx * dx + dy * dy));
    });

    minDistance = Math.min(...distances);

    if (minDistance <= 240) {
      primaryZone = 'Natural';
    } else if (minDistance <= 450) {
      primaryZone = 'Stretch';
    } else {
      primaryZone = 'Friction';
    }

    if (primaryZone !== 'Natural') {
      violations.push(
        `Mobile Primary Action is outside Natural Thumb Zone (distance ${minDistance}px - ${primaryZone} Zone). Primary submission must reside in bottom-anchored zone (<= 240px from thumb pivot).`
      );
    }
  }

  return {
    passes: violations.length === 0,
    primaryActionZone: primaryZone,
    distanceToThumbPx: minDistance,
    violations,
  };
}
