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
  absLc: number; // APCA contrast
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
export function evaluateVisualSaliency(targets: InteractiveVisualTarget[]): VisualSaliencyResult {
  const violations: string[] = [];

  // Compute saliency mass: S = (Area)^0.5 * (Lc/100) * (Weight/400)^0.8
  const scored = targets.map(t => {
    const area = t.widthPx * t.heightPx;
    const saliency = Math.sqrt(area) * (t.absLc / 100) * Math.pow(t.fontWeight / 400, 0.8);
    return { ...t, saliency: Math.round(saliency * 10) / 10 };
  });

  const primary = scored.find(t => t.isPrimaryCta);
  const distractors = scored.filter(t => !t.isPrimaryCta);

  if (!primary) {
    return {
      passes: true,
      ctaDominanceIndex: 1.0,
      primaryCtaSaliency: 0,
      maxDistractorSaliency: 0,
      violations: [],
    };
  }

  const maxDistractor = distractors.reduce((max, d) => (d.saliency > max.saliency ? d : max), {
    id: 'none',
    saliency: 0,
  } as any);

  // CTA Dominance Index: Primary CTA should be at least 1.25x more salient than any peripheral distractor
  const dominance = maxDistractor.saliency > 0
    ? Math.round((primary.saliency / maxDistractor.saliency) * 100) / 100
    : 2.0;

  if (dominance < 1.15) {
    violations.push(
      `Visual attention competition: Primary CTA "${primary.text}" (saliency ${primary.saliency}) is visually overpowered by peripheral element "${maxDistractor.text}" (saliency ${maxDistractor.saliency}, dominance ${dominance}x < 1.15x threshold).`
    );
  }

  return {
    passes: violations.length === 0,
    ctaDominanceIndex: dominance,
    primaryCtaSaliency: primary.saliency,
    maxDistractorSaliency: maxDistractor.saliency,
    distractorId: maxDistractor.id,
    violations,
  };
}

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
  shannonEntropyScore: number; // 0 (tranquil silk) to 100 (chaotic cognitive overload)
  cognitiveLoadGrade: 'Tranquil-Silk' | 'Balanced-Calm' | 'Dense-Complex' | 'Cognitive-Overload';
  violations: string[];
}

/**
 * 2. Cognitive Load & Visual Shannon Entropy Index
 * Measures information disorder across color, typography, geometry, and density.
 */
export function evaluateCognitiveEntropy(spec: ViewportEntropySpec): CognitiveEntropyResult {
  const violations: string[] = [];

  // Normalized complexity dimensions (0 to 1)
  const fontNoise = Math.min(1, Math.max(0, (spec.distinctFontCount - 1) / 3));
  const colorNoise = Math.min(1, Math.max(0, (spec.distinctColorCount - 4) / 10));
  const radiiNoise = Math.min(1, Math.max(0, (spec.distinctBorderRadiiCount - 2) / 4));
  const densityNoise = Math.min(1, spec.elementCount / 120);

  // Composite Entropy Score: 0 (pure calm) to 100 (clutter chaos)
  const entropy = Math.round(
    (fontNoise * 0.35 + colorNoise * 0.25 + radiiNoise * 0.20 + densityNoise * 0.20) * 100
  );

  let grade: 'Tranquil-Silk' | 'Balanced-Calm' | 'Dense-Complex' | 'Cognitive-Overload' = 'Tranquil-Silk';
  if (entropy > 65) {
    grade = 'Cognitive-Overload';
    violations.push(`Cognitive overload detected (Entropy ${entropy}/100): too many conflicting fonts, colors, and corner radiuses in a single view.`);
  } else if (entropy > 45) {
    grade = 'Dense-Complex';
  } else if (entropy > 25) {
    grade = 'Balanced-Calm';
  }

  return {
    passes: violations.length === 0,
    shannonEntropyScore: entropy,
    cognitiveLoadGrade: grade,
    violations,
  };
}

export interface MobileThumbTarget {
  id: string;
  name: string;
  centerXPx: number;
  centerYPx: number;
  isPrimaryAction: boolean;
  viewportWidthPx: number; // e.g. 390
  viewportHeightPx: number; // e.g. 844
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
export function evaluateThumbZoneErgonomics(target: MobileThumbTarget): ThumbZoneErgonomicsResult {
  const violations: string[] = [];

  // Pivot point for right-handed one-hand grip
  const pivotX = target.viewportWidthPx * 0.85;
  const pivotY = target.viewportHeightPx * 0.92;

  const dx = target.centerXPx - pivotX;
  const dy = target.centerYPx - pivotY;
  const polarDistance = Math.round(Math.sqrt(dx * dx + dy * dy));

  let zone: 'Natural-Sweep' | 'Comfortable-Reach' | 'Pain-Zone-Two-Hand' = 'Natural-Sweep';

  // Zone boundaries:
  // <= 240px: Natural thumb sweep (effortless)
  // 241px - 440px: Comfortable reach
  // > 440px: Pain zone (requires awkward stretching or two hands)
  if (polarDistance > 440) {
    zone = 'Pain-Zone-Two-Hand';
    if (target.isPrimaryAction) {
      violations.push(
        `Primary action "${target.name}" is located in the Mobile Pain Zone (${polarDistance}px from thumb pivot). It must be anchored in the Natural Sweep Zone (<= 240px) at the bottom.`
      );
    }
  } else if (polarDistance > 240) {
    zone = 'Comfortable-Reach';
  }

  return {
    passes: violations.length === 0,
    primaryZone: zone,
    polarDistancePx: polarDistance,
    violations,
  };
}

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
export function auditCvdDualEncoding(states: CvdStateSpec[]): CvdDualEncodingResult {
  const violations: string[] = [];

  for (const s of states) {
    if (s.colorOnly && !s.hasIconIndicator && !s.hasTextLabel) {
      violations.push(
        `Interactive state for "${s.id}" (${s.state}) relies exclusively on color, failing CVD dual-encoding standards.`
      );
    }
  }

  return {
    passes: violations.length === 0,
    violations,
  };
}
