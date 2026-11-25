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

export type ProportionalTextRole =
  | 'display'
  | 'headline'
  | 'body'
  | 'caption'
  | 'code'
  | 'micro'
  | 'control'
  | 'sub_fluent'
  | 'spot';

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
export function computeProportionalTracking(fontSizePx: number): ProportionalTrackingBounds {
  const s = Math.max(1, fontSizePx);
  let idealEm = 0;
  let minEm = -0.02;
  let maxEm = 0.05;

  if (s <= 12) {
    idealEm = 0.04;
    minEm = 0.02;
    maxEm = 0.08;
  } else if (s <= 14) {
    idealEm = 0.02;
    minEm = 0.01;
    maxEm = 0.05;
  } else if (s <= 18) {
    idealEm = 0.005;
    minEm = -0.005;
    maxEm = 0.03;
  } else if (s <= 28) {
    idealEm = -0.008;
    minEm = -0.018;
    maxEm = 0.01;
  } else if (s <= 42) {
    idealEm = -0.015;
    minEm = -0.025;
    maxEm = 0.005;
  } else {
    // 48px+
    idealEm = -0.022;
    minEm = -0.035;
    maxEm = 0.00;
  }

  return {
    idealEm: Math.round(idealEm * 1000) / 1000,
    minEm: Math.round(minEm * 1000) / 1000,
    maxEm: Math.round(maxEm * 1000) / 1000,
    idealPx: Math.round(s * idealEm * 100) / 100,
  };
}

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
export function computeProportionalLeading(
  fontSizePx: number,
  role: ProportionalTextRole = 'body'
): ProportionalLeadingBounds {
  const s = Math.max(1, fontSizePx);
  let idealRatio = 1.55;
  let minRatio = 1.40;
  let maxRatio = 1.75;

  if (role === 'display' || s >= 48) {
    idealRatio = 1.10;
    minRatio = 1.05;
    maxRatio = 1.22;
  } else if (role === 'headline' || s >= 24) {
    idealRatio = 1.22;
    minRatio = 1.12;
    maxRatio = 1.32;
  } else if (role === 'micro' || role === 'caption' || s <= 13) {
    idealRatio = 1.62;
    minRatio = 1.50;
    maxRatio = 1.75;
  } else {
    // Standard body text (14px - 22px)
    idealRatio = 1.52;
    minRatio = 1.42;
    maxRatio = 1.68;
  }

  return {
    idealRatio: Math.round(idealRatio * 100) / 100,
    minRatio: Math.round(minRatio * 100) / 100,
    maxRatio: Math.round(maxRatio * 100) / 100,
    idealLineHeightPx: Math.round(s * idealRatio * 10) / 10,
  };
}

export interface ProportionalWordSpacingBounds {
  idealPx: number;
  minPx: number; // WCAG 1.4.12 floor is 0.16 * fontSize
  maxPx: number; // Above this, rivers of white emerge
}

/**
 * 3. Proportional Word Spacing (WCAG 1.4.12 & Saccadic Landing Pads)
 */
export function computeProportionalWordSpacing(fontSizePx: number): ProportionalWordSpacingBounds {
  const s = Math.max(1, fontSizePx);
  return {
    idealPx: Math.round(s * 0.25 * 10) / 10,
    minPx: Math.round(s * 0.16 * 10) / 10, // WCAG 1.4.12 legal floor
    maxPx: Math.round(s * 0.38 * 10) / 10,
  };
}

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
export function computeProportionalContainerSpacing(
  fontSizePx: number
): ProportionalContainerSpacingBounds {
  const s = Math.max(1, fontSizePx);
  const minPaddingPx = Math.max(16, Math.round(s * 1.25));
  const idealPaddingPx = Math.round(s * 1.50);
  const maxChildGapPx = Math.round(idealPaddingPx * 0.75);
  const idealGutterPx = idealPaddingPx;

  return {
    minPaddingPx,
    idealPaddingPx,
    maxChildGapPx,
    idealGutterPx,
  };
}

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
  score: number; // 0 to 100
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
export function auditProportionalSpacing(spec: ProportionalSpacingSpec): ProportionalSpacingResult {
  const hardBaselineViolations: string[] = [];
  const advisories: string[] = [];
  const remediations: string[] = [];
  let score = 100;

  const role: ProportionalTextRole = spec.role ?? 'body';
  const fontSize = spec.fontSizePx;
  const isMobile = !!spec.isMobile;

  // ── A. HARD BASELINE CHECK: Font Size Floor (WCAG 1.4.4) ────────────
  const minFontFloor = isMobile ? 14 : 12;
  if (fontSize < minFontFloor) {
    hardBaselineViolations.push(
      `[HARD BASELINE ERROR] Font size (${fontSize}px) is below the absolute legibility floor (${minFontFloor}px for ${isMobile ? 'mobile' : 'web'}). Sub-pixel diffraction blur causes character disintegration (WCAG 1.4.4).`
    );
    remediations.push(`Increase font size to at least ${minFontFloor}px.`);
    score -= 35;
  }

  // ── B. PROPORTIONAL LEADING EVALUATION ──────────────────────────────
  const leadingBounds = computeProportionalLeading(fontSize, role);
  const actualLineHeightPx = spec.lineHeightPx ?? (fontSize * leadingBounds.idealRatio);
  const actualLeadingRatio = Math.round((actualLineHeightPx / fontSize) * 100) / 100;

  // Hard baseline crushed leading failure:
  const hardLeadingFloor = (role === 'headline' || role === 'display' || fontSize >= 24) ? 1.05 : 1.30;
  if (actualLeadingRatio < hardLeadingFloor) {
    hardBaselineViolations.push(
      `[HARD BASELINE ERROR] Crushed leading ratio (${actualLeadingRatio.toFixed(2)}x) is below legal baseline floor (${hardLeadingFloor.toFixed(2)}x). Descenders collide with ascenders (WCAG 1.4.12).`
    );
    remediations.push(`Expand line-height to at least ${(fontSize * leadingBounds.idealRatio).toFixed(0)}px (${leadingBounds.idealRatio}x ratio).`);
    score -= 35;
  } else {
    // Proportional curve tolerance
    const delta = Math.abs(actualLeadingRatio - leadingBounds.idealRatio);
    if (delta > 0.12) {
      advisories.push(
        `Leading ratio (${actualLeadingRatio.toFixed(2)}x) diverges from proportional ideal (${leadingBounds.idealRatio}x for ${fontSize}px ${role}). Optimal range: ${leadingBounds.minRatio}x - ${leadingBounds.maxRatio}x.`
      );
      score -= 15;
    } else if (delta > 0.06) {
      advisories.push(
        `Leading ratio (${actualLeadingRatio.toFixed(2)}x) slightly diverges from proportional ideal (${leadingBounds.idealRatio}x for ${fontSize}px ${role}).`
      );
      score -= 8;
    }
  }

  // ── C. PROPORTIONAL TRACKING EVALUATION (LETTER-SPACING) ────────────
  const trackingBounds = computeProportionalTracking(fontSize);
  const actualTrackingEm = spec.letterSpacingEm ?? trackingBounds.idealEm;

  // Hard baseline negative tracking failure on small text:
  if (fontSize <= 14 && actualTrackingEm < 0.0) {
    hardBaselineViolations.push(
      `[HARD BASELINE ERROR] Negative letter-spacing (${actualTrackingEm}em) on small text (${fontSize}px). Causes severe visual crowding and glyph confusion (WCAG 1.4.12).`
    );
    remediations.push(`Set letter-spacing to at least +${trackingBounds.minEm}em for ${fontSize}px copy.`);
    score -= 30;
  } else {
    if (actualTrackingEm < trackingBounds.minEm || actualTrackingEm > trackingBounds.maxEm) {
      advisories.push(
        `Tracking (${actualTrackingEm}em) is outside optical comfort band (${trackingBounds.minEm}em to ${trackingBounds.maxEm}em) for ${fontSize}px font.`
      );
      score -= 12;
    }
  }

  // ── D. PROPORTIONAL WORD SPACING (WCAG 1.4.12) ─────────────────────
  let actualWordRatio: number | undefined;
  if (spec.wordSpacingPx !== undefined) {
    const wordBounds = computeProportionalWordSpacing(fontSize);
    actualWordRatio = Math.round((spec.wordSpacingPx / fontSize) * 100) / 100;

    // Hard baseline: WCAG 1.4.12 mandates at least 0.16x font size
    if (actualWordRatio < 0.16) {
      hardBaselineViolations.push(
        `[HARD BASELINE ERROR] Word spacing (${spec.wordSpacingPx}px / ${actualWordRatio}x) violates WCAG 1.4.12 minimum floor of 0.16x font size (${wordBounds.minPx}px). Saccadic word boundary segmentation fails.`
      );
      remediations.push(`Set word-spacing to at least ${wordBounds.minPx}px (0.16x) or ideal ${wordBounds.idealPx}px (0.25x).`);
      score -= 25;
    } else if (spec.wordSpacingPx > wordBounds.maxPx) {
      advisories.push(
        `Word spacing (${spec.wordSpacingPx}px) is excessively loose (max ${wordBounds.maxPx}px recommended), inducing distracting rivers of white.`
      );
      score -= 5;
    }
  }

  // ── E. GESTALT ENCLOSURE RATIO (PADDING VS GAP) ─────────────────────
  let gestaltEnclosureRatio: number | undefined;
  if (spec.containerPaddingPx !== undefined && spec.childGapPx !== undefined) {
    const gap = Math.max(0.001, spec.childGapPx);
    gestaltEnclosureRatio = Math.round((spec.containerPaddingPx / gap) * 100) / 100;

    // Hard baseline: padding strictly below 0.85x child gap ruptures container enclosure
    if (gestaltEnclosureRatio < 0.85) {
      hardBaselineViolations.push(
        `[HARD BASELINE ERROR] Gestalt enclosure collapse: container padding (${spec.containerPaddingPx}px) is smaller than child gap (${spec.childGapPx}px), ratio ${gestaltEnclosureRatio}. Container boundaries explode.`
      );
      remediations.push(`Increase container padding to at least ${spec.childGapPx}px (ideally 1.5x child gap).`);
      score -= 25;
    } else if (gestaltEnclosureRatio < 1.0) {
      advisories.push(
        `Gestalt enclosure ratio (${gestaltEnclosureRatio}) is slightly tight: recommend padding >= child gap.`
      );
      score -= 10;
    }
  }

  // ── F. READING MEASURE (LINE LENGTH) ───────────────────────────────
  if (spec.readingMeasureChars !== undefined) {
    if (spec.readingMeasureChars > 85) {
      hardBaselineViolations.push(
        `[HARD BASELINE ERROR] Reading measure (${spec.readingMeasureChars} characters) exceeds the WCAG 1.4.8 AAA 80-character maximum ceiling. Return-sweep saccades will drift vertically.`
      );
      remediations.push('Constrain reading channel max-width to 65ch - 75ch.');
      score -= 20;
    } else if (spec.readingMeasureChars > 72) {
      advisories.push(
        `Reading measure (${spec.readingMeasureChars}ch) is wider than optimal Swiss measure (45ch - 65ch).`
      );
      score -= 5;
    }
  }

  const finalScore = Math.max(0, score);
  const isHardBaselineFailure = hardBaselineViolations.length > 0;

  // Tier Classification:
  let level: SpacingConformanceLevel = 'Gold';
  if (isHardBaselineFailure || finalScore < 60) {
    level = 'Fail';
  } else if (finalScore < 75) {
    level = 'Bronze';
  } else if (finalScore < 90) {
    level = 'Silver';
  }

  return {
    id: spec.id,
    level,
    score: finalScore,
    isHardBaselineFailure,
    hardBaselineViolations,
    advisories,
    metrics: {
      fontSizePx: fontSize,
      leadingRatio: actualLeadingRatio,
      idealLeadingRatio: leadingBounds.idealRatio,
      trackingEm: actualTrackingEm,
      idealTrackingEm: trackingBounds.idealEm,
      wordSpacingRatio: actualWordRatio,
      gestaltEnclosureRatio,
      measureChars: spec.readingMeasureChars,
    },
    remediations: Array.from(new Set(remediations)),
  };
}

// ── 6. CANONICAL TYPOGRAPHIC ROLES & MODULAR SCALES ──────────────────

export type CanonicalFontScaleRole =
  | 'micro'      // Fine print, copyright footnotes, legal disclaimers
  | 'caption'    // Form field descriptions, helper text, timestamps, tag chips
  | 'body_sm'    // Dense data grids, secondary copy, compact cards
  | 'body'       // Primary continuous fluent reading, input fields, interactive buttons
  | 'subhead'    // Section leads, lead paragraphs, card sub-headers
  | 'h3'         // Card titles, modal dialog headers, list section headers
  | 'h2'         // Major section headings, panel headers
  | 'h1'         // Page title, primary screen heading
  | 'display';   // Marketing hero banners, impact metrics, billboard titles

export interface TypographicRoleConstraint {
  role: CanonicalFontScaleRole;
  description: string;
  minPxDesktop: number;
  minPxMobile: number;
  defaultPx: number;
  maxPx: number;
  modularStep: number;
  minContrastLc: number; // APCA Lc requirement
}

export const TYPOGRAPHIC_ROLE_CANON: Record<CanonicalFontScaleRole, TypographicRoleConstraint> = {
  micro: {
    role: 'micro',
    description: 'Fine print, copyright footnotes, legal disclaimers',
    minPxDesktop: 11,
    minPxMobile: 11,
    defaultPx: 11,
    maxPx: 13,
    modularStep: -2,
    minContrastLc: 75,
  },
  caption: {
    role: 'caption',
    description: 'Form field descriptions, helper text, timestamps, tag chips',
    minPxDesktop: 12,
    minPxMobile: 12,
    defaultPx: 12,
    maxPx: 14,
    modularStep: -1,
    minContrastLc: 70,
  },
  body_sm: {
    role: 'body_sm',
    description: 'Dense data grids, secondary copy, compact cards',
    minPxDesktop: 14,
    minPxMobile: 14,
    defaultPx: 14,
    maxPx: 16,
    modularStep: -0.5,
    minContrastLc: 65,
  },
  body: {
    role: 'body',
    description: 'Primary continuous fluent reading, input fields, interactive buttons',
    minPxDesktop: 14, // absolute minimum floor (16px strongly recommended)
    minPxMobile: 16, // 16px floor to prevent iOS Safari auto-zoom
    defaultPx: 16,
    maxPx: 18,
    modularStep: 0,
    minContrastLc: 60,
  },
  subhead: {
    role: 'subhead',
    description: 'Section leads, lead paragraphs, card sub-headers',
    minPxDesktop: 18,
    minPxMobile: 17,
    defaultPx: 20,
    maxPx: 24,
    modularStep: 1,
    minContrastLc: 55,
  },
  h3: {
    role: 'h3',
    description: 'Card titles, modal dialog headers, list section headers',
    minPxDesktop: 20,
    minPxMobile: 19,
    defaultPx: 24,
    maxPx: 28,
    modularStep: 2,
    minContrastLc: 50,
  },
  h2: {
    role: 'h2',
    description: 'Major section headings, panel headers',
    minPxDesktop: 24,
    minPxMobile: 22,
    defaultPx: 32,
    maxPx: 38,
    modularStep: 3,
    minContrastLc: 45,
  },
  h1: {
    role: 'h1',
    description: 'Page title, primary screen heading',
    minPxDesktop: 28,
    minPxMobile: 26,
    defaultPx: 40,
    maxPx: 52,
    modularStep: 4,
    minContrastLc: 45,
  },
  display: {
    role: 'display',
    description: 'Marketing hero banners, impact metrics, billboard titles',
    minPxDesktop: 36,
    minPxMobile: 32,
    defaultPx: 56,
    maxPx: 96,
    modularStep: 5,
    minContrastLc: 40,
  },
};

export type ModularScalePreset =
  | 'major-second'     // 1.125 (dense data, dashboards)
  | 'minor-third'      // 1.200 (modern SaaS default)
  | 'major-third'      // 1.250 (classic Swiss typography)
  | 'perfect-fourth'   // 1.333 (editorial & marketing)
  | 'augmented-fourth' // 1.414 (high dynamic range)
  | 'golden-ratio';    // 1.618 (dramatic hero)

export const MODULAR_SCALE_RATIOS: Record<ModularScalePreset, number> = {
  'major-second': 1.125,
  'minor-third': 1.200,
  'major-third': 1.250,
  'perfect-fourth': 1.333,
  'augmented-fourth': 1.414,
  'golden-ratio': 1.618,
};

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
export function generateModularTypographicScale(
  options: ModularScaleOptions = {}
): Record<CanonicalFontScaleRole, ScaledRoleTypography> {
  const basePx = Math.max(12, options.basePx ?? 16);
  const ratio = typeof options.ratio === 'number'
    ? options.ratio
    : (MODULAR_SCALE_RATIOS[options.ratio ?? 'major-third'] ?? 1.250);
  const isMobile = !!options.isMobile;

  const result: Partial<Record<CanonicalFontScaleRole, ScaledRoleTypography>> = {};

  const roles = Object.keys(TYPOGRAPHIC_ROLE_CANON) as CanonicalFontScaleRole[];

  for (const role of roles) {
    const meta = TYPOGRAPHIC_ROLE_CANON[role];
    const rawPx = basePx * Math.pow(ratio, meta.modularStep);
    const minFloor = isMobile ? meta.minPxMobile : meta.minPxDesktop;
    const computedFontSizePx = Math.max(minFloor, Math.round(rawPx));

    const leadingBounds = computeProportionalLeading(
      computedFontSizePx,
      role === 'display' ? 'display' : (role === 'h1' || role === 'h2' || role === 'h3' ? 'headline' : (role === 'micro' || role === 'caption' ? 'caption' : 'body'))
    );
    const trackingBounds = computeProportionalTracking(computedFontSizePx);

    result[role] = {
      role,
      fontSizePx: computedFontSizePx,
      lineHeightPx: leadingBounds.idealLineHeightPx,
      leadingRatio: leadingBounds.idealRatio,
      letterSpacingEm: trackingBounds.idealEm,
      letterSpacingPx: trackingBounds.idealPx,
      minContrastLc: meta.minContrastLc,
    };
  }

  return result as Record<CanonicalFontScaleRole, ScaledRoleTypography>;
}

export interface TypographicRoleAuditResult {
  passes: boolean;
  isHardFailure: boolean;
  violations: string[];
  recommendedPx: number;
}

/**
 * Validates a font size against its semantic role's ergonomic and legal constraints.
 */
export function auditTypographicRole(
  role: CanonicalFontScaleRole,
  fontSizePx: number,
  isMobile = false
): TypographicRoleAuditResult {
  const meta = TYPOGRAPHIC_ROLE_CANON[role];
  const violations: string[] = [];
  let isHardFailure = false;

  const minFloor = isMobile ? meta.minPxMobile : meta.minPxDesktop;

  if (fontSizePx < minFloor) {
    isHardFailure = true;
    violations.push(
      `[HARD BASELINE ERROR] ${role} font size (${fontSizePx}px) is below its physical legibility floor (${minFloor}px for ${isMobile ? 'mobile' : 'desktop'}). Subtended visual angle causes glyph collapse.`
    );
  } else if (fontSizePx > meta.maxPx) {
    violations.push(
      `[ADVISORY] ${role} font size (${fontSizePx}px) exceeds ergonomic category ceiling (${meta.maxPx}px). Visual hierarchy balance disrupted.`
    );
  }

  // Mobile input zoom trap check
  if (isMobile && role === 'body' && fontSizePx < 16) {
    isHardFailure = true;
    violations.push(
      `[HARD BASELINE ERROR] Mobile body/input font size (${fontSizePx}px) is below 16px. Triggers automatic destructive viewport zoom on iOS Safari.`
    );
  }

  return {
    passes: violations.length === 0,
    isHardFailure,
    violations,
    recommendedPx: meta.defaultPx,
  };
}
