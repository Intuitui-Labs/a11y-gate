/**
 * @intuitui-labs/a11y-gate - Exhaustive WCAG 3 / APCA Lightness Contrast Engine
 *
 * Implements the W3C APCA 0.98G / WCAG 3 Candidate Visual Contrast Model:
 * 1. Perceptual Lightness Contrast (Lc) calculations with halation / polarity detection
 * 2. Conformance levels: Gold (Lc >= 90), Silver (Lc >= 75), Bronze (Lc >= 60), UI/Graphic (Lc >= 45)
 * 3. Exhaustive spatial frequency & font weight matrix across all weights (w100 through w900)
 * 4. Contextual evaluation: fluent body text, sub-fluent, headlines, UI components, icons
 */

import {
  calculateApca,
  getRelativeLuminance,
  hexToRgb,
  type RGB,
} from './contrast-math.js';

export type Wcag3ConformanceLevel = 'Gold' | 'Silver' | 'Bronze' | 'Component' | 'Fail';

export type ContrastPolarity = 'BoW' | 'WoB'; // Black on White (dark text) vs White on Black (light text)

export type TextRole =
  | 'body'        // Fluent reading, continuous body text
  | 'sub_fluent'   // Secondary body, captions, footnotes
  | 'headline'     // Section titles, major headlines, hero text
  | 'control'      // Buttons, interactive inputs, navigation labels
  | 'spot'         // Single word badges, tabs, chips
  | 'icon_graphic' // Non-text icons, active borders, infographics
  | 'disabled';    // Non-essential, placeholder, inactive elements

export interface Wcag3FontWeightMatrix {
  w100: number; // Thin
  w200: number; // Extra Light
  w300: number; // Light
  w400: number; // Normal / Regular
  w500: number; // Medium
  w600: number; // Semi Bold
  w700: number; // Bold
  w800: number; // Extra Bold
  w900: number; // Black / Ultra Bold
}

export interface Wcag3EvaluationResult {
  score: number;                     // Raw APCA Lc (-108 to 106)
  absScore: number;                  // |Lc|
  polarity: ContrastPolarity;        // BoW or WoB
  level: Wcag3ConformanceLevel;      // Gold, Silver, Bronze, Component, Fail
  ratingText: string;                // Descriptive rating
  minFontMatrix: Wcag3FontWeightMatrix; // Minimum recommended font sizes in px
  passesRole: Record<TextRole, boolean>;
  recommendations: string[];
}

/**
 * Standard WCAG 3 Candidate APCA Threshold Constants
 */
export const WCAG3_THRESHOLDS = {
  GOLD: 90,           // Preferred body text across all conditions
  SILVER: 75,         // Strict minimum for continuous fluent body text
  BRONZE: 60,         // Minimum for large text, headlines, and essential controls
  COMPONENT: 45,      // Minimum for interactive borders, icons, and non-text graphics
  SPOT: 30,           // Minimum for non-essential or disabled elements
  CUTOFF: 15,         // Below this, contrast is imperceptible
} as const;

/**
 * Determine contrast polarity (Dark-on-Light BoW vs Light-on-Dark WoB).
 */
export function getContrastPolarity(textColor: string | RGB, bgColor: string | RGB): ContrastPolarity {
  const textRgb = typeof textColor === 'string' ? hexToRgb(textColor) : textColor;
  const bgRgb = typeof bgColor === 'string' ? hexToRgb(bgColor) : bgColor;

  const yText = getRelativeLuminance(textRgb);
  const yBg = getRelativeLuminance(bgRgb);

  // If background luminance is higher than text luminance, it's dark text on light (BoW)
  return yBg >= yText ? 'BoW' : 'WoB';
}

/**
 * Full font-weight lookup matrix across all CSS font-weight tiers (w100 to w900).
 * Based on APCA 0.98G spatial frequency curves.
 */
export function getExhaustiveApcaFontMatrix(absLc: number): Wcag3FontWeightMatrix {
  if (absLc >= 90) {
    return {
      w100: 36,
      w200: 24,
      w300: 18,
      w400: 14,
      w500: 12,
      w600: 11,
      w700: 10,
      w800: 10,
      w900: 9,
    };
  }
  if (absLc >= 75) {
    return {
      w100: 48,
      w200: 32,
      w300: 21,
      w400: 16,
      w500: 14,
      w600: 13,
      w700: 12,
      w800: 11,
      w900: 10,
    };
  }
  if (absLc >= 60) {
    return {
      w100: 64,
      w200: 42,
      w300: 28,
      w400: 21,
      w500: 18,
      w600: 16,
      w700: 14,
      w800: 13,
      w900: 12,
    };
  }
  if (absLc >= 45) {
    return {
      w100: 96,
      w200: 64,
      w300: 42,
      w400: 32,
      w500: 26,
      w600: 22,
      w700: 18,
      w800: 16,
      w900: 14,
    };
  }
  if (absLc >= 30) {
    return {
      w100: 120,
      w200: 84,
      w300: 56,
      w400: 42,
      w500: 36,
      w600: 30,
      w700: 24,
      w800: 20,
      w900: 18,
    };
  }
  // Sub-30 Lc: Unsuitable for regular text
  return {
    w100: 160,
    w200: 120,
    w300: 84,
    w400: 64,
    w500: 54,
    w600: 48,
    w700: 36,
    w800: 32,
    w900: 28,
  };
}

/**
 * Determine WCAG 3 conformance tier.
 */
export function getWcag3Level(absLc: number): Wcag3ConformanceLevel {
  if (absLc >= WCAG3_THRESHOLDS.GOLD) return 'Gold';
  if (absLc >= WCAG3_THRESHOLDS.SILVER) return 'Silver';
  if (absLc >= WCAG3_THRESHOLDS.BRONZE) return 'Bronze';
  if (absLc >= WCAG3_THRESHOLDS.COMPONENT) return 'Component';
  return 'Fail';
}

/**
 * Exhaustively evaluates a color pair against WCAG 3 / APCA candidate standards.
 */
export function evaluateWcag3(textColor: string, bgColor: string): Wcag3EvaluationResult {
  const score = calculateApca(textColor, bgColor);
  const absScore = Math.abs(score);
  const polarity = getContrastPolarity(textColor, bgColor);
  const level = getWcag3Level(absScore);
  const minFontMatrix = getExhaustiveApcaFontMatrix(absScore);

  const passesRole: Record<TextRole, boolean> = {
    body: absScore >= WCAG3_THRESHOLDS.SILVER,
    sub_fluent: absScore >= WCAG3_THRESHOLDS.BRONZE,
    headline: absScore >= WCAG3_THRESHOLDS.BRONZE,
    control: absScore >= WCAG3_THRESHOLDS.BRONZE,
    spot: absScore >= WCAG3_THRESHOLDS.COMPONENT,
    icon_graphic: absScore >= WCAG3_THRESHOLDS.COMPONENT,
    disabled: absScore >= WCAG3_THRESHOLDS.SPOT,
  };

  const recommendations: string[] = [];
  if (absScore < WCAG3_THRESHOLDS.CUTOFF) {
    recommendations.push('Contrast is negligible (Lc < 15). Completely unreadable.');
  } else if (absScore < WCAG3_THRESHOLDS.COMPONENT) {
    recommendations.push('Fails minimum UI component threshold (Lc 45). Do not use for interactive controls or icons.');
  } else if (absScore < WCAG3_THRESHOLDS.SILVER) {
    recommendations.push(`Suitable for headings or controls (Lc ${absScore.toFixed(1)}), but too low for continuous body text (requires Lc >= 75).`);
  } else if (absScore >= WCAG3_THRESHOLDS.GOLD) {
    recommendations.push('Optimal contrast meeting Gold standard (Lc >= 90). Suitable for fine text down to 14px weight 400.');
  }

  let ratingText = 'Unsatisfactory';
  if (level === 'Gold') ratingText = 'Gold (Optimal Body Text)';
  else if (level === 'Silver') ratingText = 'Silver (Fluent Body Text Minimum)';
  else if (level === 'Bronze') ratingText = 'Bronze (Large Text & Controls)';
  else if (level === 'Component') ratingText = 'Component (Icons & Borders Only)';

  return {
    score,
    absScore,
    polarity,
    level,
    ratingText,
    minFontMatrix,
    passesRole,
    recommendations,
  };
}
