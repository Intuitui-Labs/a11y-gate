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

import { calculateApca } from './contrast-math.js';

// ── 1. MATHEMATICAL RATIO CONSTANTS ──────────────────────────────────

export const PSYCHOPHYSICAL_RATIOS = {
  // Proximity Law: Next-group gap must exceed label-input gap by at least 1.5x
  GESTALT_PROXIMITY_MIN: 1.50,
  GESTALT_PROXIMITY_OPTIMAL: 2.50,

  // Heading Clinging Law: MarginTop must be at least 2.0x MarginBottom so headings physically hug their section
  HEADING_CLINGING_MIN: 2.00,
  HEADING_CLINGING_OPTIMAL: 3.00,

  // Gestalt Enclosure: Inner container padding must be >= child gap
  GESTALT_ENCLOSURE_MIN: 1.00,

  // Meso Spatial Inequality: Inter-container gutter must be >= 0.75x intra-container padding
  SPATIAL_HIERARCHY_INEQUALITY_MIN: 0.75,

  // Macro Canvas Margin Ratio: Outer margin / Viewport width (4% to 8%)
  CANVAS_MARGIN_RATIO_MIN: 0.04,
  CANVAS_MARGIN_RATIO_OPTIMAL: 0.06,

  // Macro Whitespace Ratio: Empty space / Total canvas area (minimum 20% breathing room)
  WHITESPACE_RATIO_MIN: 0.20,

  // Touch Target to Visual Glyph Ratio: HitArea dimension / VisualIcon dimension (>= 2.5x, min 44px)
  TOUCH_TO_GLYPH_RATIO_MIN: 2.20,
  TOUCH_TARGET_FLOOR_PX: 44,

  // Optical Stem Thickness Floor: Below 14px, stroke width must not drop below 1.25px
  OPTICAL_STEM_FLOOR_PX: 1.25,

  // Typography Leading (Line-Height / Font-Size)
  LEADING_BODY_MIN: 1.45,
  LEADING_BODY_MAX: 1.68,
  LEADING_HEADING_MIN: 1.12,
  LEADING_HEADING_MAX: 1.30,

  // Typography Tracking (Letter-Spacing / Font-Size in em)
  TRACKING_MICRO_MIN_EM: 0.02,
  TRACKING_DISPLAY_MAX_EM: 0.005,

  // APCA Contrast Lightness Floors
  APCA_MICRO_COPY_MIN: 70,
  APCA_BODY_READING_MIN: 75,
  APCA_CONTROLS_MIN: 65,

  // Concentric Corner Radius: Inner radius must equal max(0, OuterRadius - Padding)
  CONCENTRIC_RADIUS_TOLERANCE_PX: 2.0,

  // Focus Ring Geometry: Apple HIG & WCAG 2.2 SC 2.4.13
  FOCUS_RING_STROKE_MIN_PX: 2.0,
  FOCUS_RING_OFFSET_MIN_PX: 2.0,
  FOCUS_TO_BORDER_RATIO_MIN: 1.5,

  // Canonical Harmonic Aspect Ratios (width / height or height / width)
  CANONICAL_ASPECT_RATIOS: {
    SQUARE: 1.000,
    CLASSIC_4_3: 1.333,
    SILVER_RATIO: 1.414, // 1 : √2 (ISO 216 / Lichtenberg)
    PHOTO_3_2: 1.500,
    GOLDEN_RATIO: 1.618, // φ = (1 + √5) / 2
    WIDESCREEN_16_9: 1.778,
  },
} as const;


// ── 2. NON-UNIFORM DYNAMIC TYPE POWER LAW SCALING ────────────────────

export interface DynamicTypeScaleInput {
  baseFontSizePx: number;
  scaleFactor: number; // e.g. 1.0 (default), 1.3 (large), 1.8 (accessibility)
  role: 'display' | 'title' | 'body' | 'caption';
}

/**
 * Computes non-uniform perceptual scaling based on Stevens' Power Law.
 * Headings scale sub-linearly (exponent ~0.7) to prevent layout rupture.
 * Body and captions scale super-linearly (exponent ~1.2) to safeguard low-vision readability.
 */
export function computeNonUniformDynamicScale(input: DynamicTypeScaleInput): {
  scaledFontSizePx: number;
  perceptualScaleRatio: number;
  exponent: number;
} {
  let exponent = 1.0;
  switch (input.role) {
    case 'display':
      exponent = 0.65;
      break;
    case 'title':
      exponent = 0.78;
      break;
    case 'body':
      exponent = 1.05;
      break;
    case 'caption':
      exponent = 1.22;
      break;
  }

  const effectiveMultiplier = Math.pow(input.scaleFactor, exponent);
  const scaledSize = Math.round(input.baseFontSizePx * effectiveMultiplier * 10) / 10;

  return {
    scaledFontSizePx: scaledSize,
    perceptualScaleRatio: effectiveMultiplier,
    exponent,
  };
}


// ── 3. OPTICAL STEM THICKNESS & STROKE VIBRATION AUDIT ───────────────

export interface OpticalStemSpec {
  fontSizePx: number;
  fontWeight: number; // 100 - 900
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
export function auditOpticalStemThickness(spec: OpticalStemSpec): OpticalStemResult {
  // Approximate stem ratio based on CSS font weight (400 = ~0.10, 700 = ~0.18, 900 = ~0.24)
  const normalizedWeight = Math.max(100, Math.min(900, spec.fontWeight));
  const stemRatio = 0.06 + (normalizedWeight / 1000) * 0.16;
  const estimatedStemWidthPx = Math.round(spec.fontSizePx * stemRatio * 100) / 100;

  const hasSubpixelDiffractionHazard =
    spec.fontSizePx < 14 && estimatedStemWidthPx < PSYCHOPHYSICAL_RATIOS.OPTICAL_STEM_FLOOR_PX;

  let violation: string | undefined;
  if (hasSubpixelDiffractionHazard) {
    violation = `Sub-14px font (${spec.fontSizePx}px @ weight ${spec.fontWeight}) has an estimated stem width of ${estimatedStemWidthPx}px, below the ${PSYCHOPHYSICAL_RATIOS.OPTICAL_STEM_FLOOR_PX}px optical threshold. This causes stroke vibration and anti-aliasing blur. Elevate font-weight to at least 600 or increase font-size.`;
  }

  return {
    passes: !hasSubpixelDiffractionHazard,
    estimatedStemWidthPx,
    stemRatio: Math.round(stemRatio * 1000) / 1000,
    hasSubpixelDiffractionHazard,
    violation,
  };
}


// ── 4. COMPLETE PSYCHOPHYSICAL RATIO SUITE AUDIT ──────────────────────

export interface PsychophysicalRatioAuditInput {
  // Macro
  viewportWidthPx: number;
  viewportHeightPx: number;
  canvasMarginHorizontalPx: number;
  contentWidthPx: number;
  readingMeasureChars?: number;

  // Meso
  interContainerGutterPx: number;
  intraContainerPaddingPx: number;
  childGapPx?: number;

  // Micro Grouping
  labelToInputGapPx?: number;
  inputToNextGroupGapPx?: number;
  headingMarginTopPx?: number;
  headingMarginBottomPx?: number;

  // Micro Typography
  fontSizePx: number;
  fontWeight: number;
  lineHeightPx?: number;
  letterSpacingEm?: number;
  colorHex?: string;
  bgHex?: string;
  role: 'display' | 'title' | 'body' | 'micro' | 'control';

  // Touch
  touchHitDimensionPx?: number;
  visualGlyphDimensionPx?: number;
}

export interface PsychophysicalRatioAuditResult {
  passes: boolean;
  score: number; // 0 - 100
  ratios: {
    canvasMarginRatio: number;
    whitespaceRatio: number;
    spatialHierarchyRatio: number;
    gestaltEnclosureRatio?: number;
    gestaltProximityRatio?: number;
    headingClingingRatio?: number;
    leadingRatio?: number;
    letterSpacingEm?: number;
    touchToGlyphRatio?: number;
    apcaContrastLc?: number;
  };
  violations: string[];
  recommendations: string[];
}

export function auditPsychophysicalRatios(
  input: PsychophysicalRatioAuditInput
): PsychophysicalRatioAuditResult {
  const violations: string[] = [];
  const recommendations: string[] = [];
  let deduction = 0;

  // 1. Macro Canvas Margin Ratio
  const vpWidth = Math.max(1, input.viewportWidthPx || 0);
  const canvasMarginRatio = input.canvasMarginHorizontalPx / vpWidth;
  if (canvasMarginRatio < PSYCHOPHYSICAL_RATIOS.CANVAS_MARGIN_RATIO_MIN) {
    violations.push(
      `Canvas margin ratio (${(canvasMarginRatio * 100).toFixed(1)}%) is below the 4.0% psychophysical floor. Peripheral visual tension will occur.`
    );
    deduction += 15;
  }

  // 2. Macro Whitespace Ratio
  const whitespaceRatio = Math.max(0, 1 - (input.contentWidthPx / vpWidth) * 0.85);
  if (input.viewportWidthPx >= 768 && whitespaceRatio < PSYCHOPHYSICAL_RATIOS.WHITESPACE_RATIO_MIN) {
    violations.push(
      `Canvas whitespace breathing ratio (${(whitespaceRatio * 100).toFixed(1)}%) is under the 20% floor, inducing claustrophobia.`
    );
    deduction += 15;
  }

  // 3. Meso Spatial Hierarchy Ratio (Gutter / Padding)
  const intraPadding = Math.max(0.001, input.intraContainerPaddingPx || 0);
  const spatialHierarchyRatio = input.interContainerGutterPx / intraPadding;
  if (spatialHierarchyRatio < PSYCHOPHYSICAL_RATIOS.SPATIAL_HIERARCHY_INEQUALITY_MIN) {
    violations.push(
      `Inter-container gutter to intra-padding ratio (${spatialHierarchyRatio.toFixed(2)}) is below 0.75. Cards will visually fuse into an undifferentiated mass.`
    );
    deduction += 20;
  }

  // 3b. Outer Margin vs Inter-Container Gutter
  if (input.canvasMarginHorizontalPx < input.interContainerGutterPx) {
    violations.push(
      `Canvas horizontal margin (${input.canvasMarginHorizontalPx}px) is smaller than inter-container gutter (${input.interContainerGutterPx}px), creating peripheral tension.`
    );
    deduction += 10;
  }

  // 3c. Micro Gestalt Enclosure Ratio (Padding / Child Gap)
  let gestaltEnclosureRatio: number | undefined;
  if (input.childGapPx !== undefined) {
    const childGap = Math.max(0.001, input.childGapPx);
    gestaltEnclosureRatio = input.intraContainerPaddingPx / childGap;
    if (gestaltEnclosureRatio < PSYCHOPHYSICAL_RATIOS.GESTALT_ENCLOSURE_MIN) {
      violations.push(
        `Gestalt enclosure ratio (${gestaltEnclosureRatio.toFixed(2)}) is below 1.00. Inner container padding (${input.intraContainerPaddingPx}px) is smaller than child gap (${input.childGapPx}px), violating Gestalt enclosure.`
      );
      deduction += 15;
    }
  }

  // 4. Micro Gestalt Proximity Ratio
  let gestaltProximityRatio: number | undefined;
  if (input.labelToInputGapPx !== undefined && input.inputToNextGroupGapPx !== undefined) {
    const labelGap = Math.max(0.001, input.labelToInputGapPx);
    gestaltProximityRatio = input.inputToNextGroupGapPx / labelGap;
    if (gestaltProximityRatio < PSYCHOPHYSICAL_RATIOS.GESTALT_PROXIMITY_MIN) {
      violations.push(
        `Gestalt proximity ratio (${gestaltProximityRatio.toFixed(2)}) is under 1.50. Field label visually uncouples from its input and adheres to preceding content.`
      );
      deduction += 25;
    }
  }

  // 5. Micro Heading Clinging Ratio
  let headingClingingRatio: number | undefined;
  if (input.headingMarginTopPx !== undefined && input.headingMarginBottomPx !== undefined) {
    const bottomMargin = Math.max(0.001, input.headingMarginBottomPx);
    headingClingingRatio = input.headingMarginTopPx / bottomMargin;
    if (headingClingingRatio < PSYCHOPHYSICAL_RATIOS.HEADING_CLINGING_MIN) {
      violations.push(
        `Heading clinging ratio (${headingClingingRatio.toFixed(2)}) violates proximity law (minimum 2.0 required). Heading does not physically hug its section.`
      );
      deduction += 15;
    }
  }

  // 6. Typographic Leading Ratio
  let leadingRatio: number | undefined;
  if (input.lineHeightPx !== undefined) {
    const fontSize = Math.max(0.001, input.fontSizePx || 0);
    leadingRatio = input.lineHeightPx / fontSize;
    if (input.role === 'body') {
      if (leadingRatio < PSYCHOPHYSICAL_RATIOS.LEADING_BODY_MIN) {
        violations.push(
          `Body leading ratio (${leadingRatio.toFixed(2)}) is crushed (minimum 1.45 required).`
        );
        deduction += 15;
      }
    } else if (input.role === 'display' || input.role === 'title') {
      if (leadingRatio > PSYCHOPHYSICAL_RATIOS.LEADING_HEADING_MAX) {
        violations.push(
          `Title leading ratio (${leadingRatio.toFixed(2)}) is over-spaced (maximum 1.30 required for cohesive headlines).`
        );
        deduction += 10;
      }
    }
  }

  // 6b. Typographic Tracking (Letter-Spacing)
  if (input.letterSpacingEm !== undefined) {
    if (input.fontSizePx <= 13) {
      if (input.letterSpacingEm < PSYCHOPHYSICAL_RATIOS.TRACKING_MICRO_MIN_EM) {
        violations.push(
          `Micro-copy (${input.fontSizePx}px) tracking (${input.letterSpacingEm}em) is squeezed: minimum +${PSYCHOPHYSICAL_RATIOS.TRACKING_MICRO_MIN_EM}em required to prevent glyph collision.`
        );
        deduction += 10;
      }
    } else if ((input.role === 'display' || input.role === 'title') && input.fontSizePx >= 28) {
      if (input.letterSpacingEm > PSYCHOPHYSICAL_RATIOS.TRACKING_DISPLAY_MAX_EM) {
        violations.push(
          `Display heading tracking (${input.letterSpacingEm}em) is over-spaced: maximum +${PSYCHOPHYSICAL_RATIOS.TRACKING_DISPLAY_MAX_EM}em allowed for cohesive headline typography.`
        );
        deduction += 10;
      }
    }
  }

  // 7. Touch Target to Glyph Ratio
  let touchToGlyphRatio: number | undefined;
  if (input.touchHitDimensionPx !== undefined && input.visualGlyphDimensionPx !== undefined) {
    touchToGlyphRatio = input.touchHitDimensionPx / input.visualGlyphDimensionPx;
    if (input.touchHitDimensionPx < PSYCHOPHYSICAL_RATIOS.TOUCH_TARGET_FLOOR_PX) {
      violations.push(
        `Touch hit target (${input.touchHitDimensionPx}px) is below the physical 44px thumb contact floor.`
      );
      deduction += 20;
    }
  }

  // 8. APCA Lightness Contrast
  let apcaContrastLc: number | undefined;
  if (input.colorHex && input.bgHex) {
    try {
      apcaContrastLc = Math.abs(calculateApca(input.colorHex, input.bgHex));
      const floor =
        input.role === 'micro'
          ? PSYCHOPHYSICAL_RATIOS.APCA_MICRO_COPY_MIN
          : input.role === 'body'
          ? PSYCHOPHYSICAL_RATIOS.APCA_BODY_READING_MIN
          : PSYCHOPHYSICAL_RATIOS.APCA_CONTROLS_MIN;

      if (apcaContrastLc < floor) {
        violations.push(
          `Text contrast (Lc ${apcaContrastLc.toFixed(1)}) fails the APCA Lc ${floor} floor for ${input.role} copy. Washed-out grey ghosting detected.`
        );
        deduction += 25;
      }
    } catch (err: any) {
      violations.push(`Text contrast evaluation failed: invalid color format (${err?.message ?? 'malformed hex'}).`);
      deduction += 25;
    }
  }

  // 9. Optical Stem Check
  const stemAudit = auditOpticalStemThickness({
    fontSizePx: input.fontSizePx,
    fontWeight: input.fontWeight,
  });
  if (!stemAudit.passes && stemAudit.violation) {
    violations.push(stemAudit.violation);
    deduction += 15;
  }

  const score = Math.max(0, 100 - deduction);

  return {
    passes: violations.length === 0,
    score,
    ratios: {
      canvasMarginRatio: Math.round(canvasMarginRatio * 1000) / 1000,
      whitespaceRatio: Math.round(whitespaceRatio * 1000) / 1000,
      spatialHierarchyRatio: Math.round(spatialHierarchyRatio * 100) / 100,
      gestaltEnclosureRatio: gestaltEnclosureRatio ? Math.round(gestaltEnclosureRatio * 100) / 100 : undefined,
      gestaltProximityRatio: gestaltProximityRatio ? Math.round(gestaltProximityRatio * 100) / 100 : undefined,
      headingClingingRatio: headingClingingRatio ? Math.round(headingClingingRatio * 100) / 100 : undefined,
      leadingRatio: leadingRatio ? Math.round(leadingRatio * 100) / 100 : undefined,
      letterSpacingEm: input.letterSpacingEm !== undefined ? input.letterSpacingEm : undefined,
      touchToGlyphRatio: touchToGlyphRatio ? Math.round(touchToGlyphRatio * 100) / 100 : undefined,
      apcaContrastLc: apcaContrastLc ? Math.round(apcaContrastLc * 10) / 10 : undefined,
    },
    violations,
    recommendations,
  };
}


// ── 5. CONCENTRIC CORNER RADIUS CANON (APPLE & SWISS ARCHITECTURE) ──

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
export function auditConcentricCornerRadius(spec: ConcentricRadiusSpec): ConcentricRadiusResult {
  const idealInnerRadiusPx = Math.max(0, spec.outerRadiusPx - spec.paddingPx);
  const deltaPx = Math.abs(spec.innerRadiusPx - idealInnerRadiusPx);
  const tolerance = spec.tolerancePx ?? PSYCHOPHYSICAL_RATIOS.CONCENTRIC_RADIUS_TOLERANCE_PX;
  const passes = deltaPx <= tolerance;

  let violation: string | undefined;
  if (!passes) {
    violation = `Concentric corner radius mismatch: outer radius (${spec.outerRadiusPx}px) with padding (${spec.paddingPx}px) geometrically demands an inner radius of ${idealInnerRadiusPx}px, but received ${spec.innerRadiusPx}px (delta: ${deltaPx}px > ${tolerance}px). The eye perceives optical buckling or non-concentric pinching.`;
  }

  return {
    passes,
    idealInnerRadiusPx,
    deltaPx: Math.round(deltaPx * 10) / 10,
    violation,
  };
}


// ── 6. FOCUS RING GEOMETRY & THICKNESS RATIO (WCAG 2.2 SC 2.4.13) ────

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
export function auditFocusRingRatio(spec: FocusRingSpec): FocusRingResult {
  const border = spec.elementBorderPx ?? 1.0;
  const strokeRatio = Math.round((spec.focusRingStrokePx / border) * 100) / 100;
  const violations: string[] = [];

  if (spec.focusRingStrokePx < PSYCHOPHYSICAL_RATIOS.FOCUS_RING_STROKE_MIN_PX) {
    violations.push(
      `Focus ring stroke (${spec.focusRingStrokePx}px) is below the 2.0px visibility threshold (WCAG 2.2 SC 2.4.13).`
    );
  }
  if (spec.focusOffsetGapPx < PSYCHOPHYSICAL_RATIOS.FOCUS_RING_OFFSET_MIN_PX) {
    violations.push(
      `Focus offset gap (${spec.focusOffsetGapPx}px) is under 2.0px, causing the ring to collide with and occlude the element border.`
    );
  }

  return {
    passes: violations.length === 0,
    strokeRatio,
    violation: violations.length > 0 ? violations.join(' ') : undefined,
  };
}


// ── 7. CANONICAL HARMONIC ASPECT RATIO AUDIT ─────────────────────────

export interface HarmonicAspectRatioSpec {
  widthPx: number;
  heightPx: number;
  tolerance?: number; // default 0.05 (5%)
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
export function auditHarmonicAspectRatio(spec: HarmonicAspectRatioSpec): HarmonicAspectRatioResult {
  const tolerance = spec.tolerance ?? 0.05;
  const major = Math.max(spec.widthPx, spec.heightPx);
  const minor = Math.min(spec.widthPx, spec.heightPx);
  const actualRatio = minor === 0 ? 1 : major / minor;

  let nearestName = 'SQUARE';
  let nearestVal = 1.0;
  let minDiff = Infinity;

  for (const [name, val] of Object.entries(PSYCHOPHYSICAL_RATIOS.CANONICAL_ASPECT_RATIOS)) {
    const diff = Math.abs(actualRatio - val);
    if (diff < minDiff) {
      minDiff = diff;
      nearestName = name;
      nearestVal = val;
    }
  }

  const deviation = Math.round(minDiff * 1000) / 1000;
  const passes = minDiff <= tolerance;

  let recommendation: string | undefined;
  if (!passes) {
    recommendation = `Aspect ratio ${actualRatio.toFixed(3)} deviates from canonical Swiss/classical ratio ${nearestName} (${nearestVal.toFixed(3)}) by ${(deviation * 100).toFixed(1)}%. Snap container dimensions to a harmonious grid multiple.`;
  }

  return {
    passes,
    aspectRatio: Math.round(actualRatio * 1000) / 1000,
    nearestCanonicalName: nearestName,
    nearestCanonicalRatio: nearestVal,
    deviation,
    recommendation,
  };
}


// ── 8. CHROMOSTEREOPSIS RETINAL ABERRATION HAZARD AUDIT ───────────────

export function auditChromostereopsisHazard(
  colorHex1: string,
  colorHex2: string
): {
  hasHazard: boolean;
  violation?: string;
} {
  const parseHex = (hex: string) => {
    const cleaned = hex.replace('#', '');
    const full =
      cleaned.length === 3
        ? cleaned
            .split('')
            .map((c) => c + c)
            .join('')
        : cleaned;
    const num = parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const c1 = parseHex(colorHex1);
  const c2 = parseHex(colorHex2);

  const isRed = (c: { r: number; g: number; b: number }) => c.r > 190 && c.g < 80 && c.b < 80;
  const isBlueOrCyan = (c: { r: number; g: number; b: number }) => c.b > 190 && c.r < 80;

  const hasHazard = (isRed(c1) && isBlueOrCyan(c2)) || (isRed(c2) && isBlueOrCyan(c1));

  return {
    hasHazard,
    violation: hasHazard
      ? `Severe chromostereopsis hazard detected between ${colorHex1} and ${colorHex2}. Saturated red and blue/cyan at adjacent borders cause retinal chromatic dispersion, making characters appear to jitter or vibrate in depth.`
      : undefined,
  };
}

/**
 * 9. Quantum Snapping & Remediation Hint Generator
 * Computes exact nearest floor and ceiling multiples of the spatial quantum (e.g. 4px or 8px)
 */
export function getNearestQuantumRemediation(
  currentPx: number,
  quantumPx: number = 4
): {
  isAligned: boolean;
  nearestFloorPx: number;
  nearestCeilPx: number;
  recommendation: string;
} {
  const isAligned = currentPx % quantumPx === 0;
  const nearestFloorPx = Math.floor(currentPx / quantumPx) * quantumPx;
  const nearestCeilPx = Math.ceil(currentPx / quantumPx) * quantumPx;

  return {
    isAligned,
    nearestFloorPx,
    nearestCeilPx,
    recommendation: isAligned
      ? `Dimension ${currentPx}px is perfectly aligned to the ${quantumPx}px quantum grid.`
      : `Dimension ${currentPx}px is misaligned. Snap to nearest ${quantumPx}px quantum: ${nearestFloorPx}px (compact) or ${nearestCeilPx}px (spacious).`,
  };
}

