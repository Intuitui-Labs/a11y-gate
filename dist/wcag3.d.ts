/**
 * @intuitui-labs/a11y-gate - Exhaustive WCAG 3 / APCA Lightness Contrast Engine
 *
 * Implements the W3C APCA 0.98G / WCAG 3 Candidate Visual Contrast Model:
 * 1. Perceptual Lightness Contrast (Lc) calculations with halation / polarity detection
 * 2. Conformance levels: Gold (Lc >= 90), Silver (Lc >= 75), Bronze (Lc >= 60), UI/Graphic (Lc >= 45)
 * 3. Exhaustive spatial frequency & font weight matrix across all weights (w100 through w900)
 * 4. Contextual evaluation: fluent body text, sub-fluent, headlines, UI components, icons
 */
import { type RGB } from './contrast-math.js';
export type Wcag3ConformanceLevel = 'Gold' | 'Silver' | 'Bronze' | 'Component' | 'Fail';
export type ContrastPolarity = 'BoW' | 'WoB';
export type TextRole = 'body' | 'sub_fluent' | 'headline' | 'control' | 'spot' | 'icon_graphic' | 'disabled';
export interface Wcag3FontWeightMatrix {
    w100: number;
    w200: number;
    w300: number;
    w400: number;
    w500: number;
    w600: number;
    w700: number;
    w800: number;
    w900: number;
}
export interface Wcag3EvaluationResult {
    score: number;
    absScore: number;
    polarity: ContrastPolarity;
    level: Wcag3ConformanceLevel;
    ratingText: string;
    minFontMatrix: Wcag3FontWeightMatrix;
    passesRole: Record<TextRole, boolean>;
    recommendations: string[];
}
/**
 * Standard WCAG 3 Candidate APCA Threshold Constants
 */
export declare const WCAG3_THRESHOLDS: {
    readonly GOLD: 90;
    readonly SILVER: 75;
    readonly BRONZE: 60;
    readonly COMPONENT: 45;
    readonly SPOT: 30;
    readonly CUTOFF: 15;
};
/**
 * Determine contrast polarity (Dark-on-Light BoW vs Light-on-Dark WoB).
 */
export declare function getContrastPolarity(textColor: string | RGB, bgColor: string | RGB): ContrastPolarity;
/**
 * Full font-weight lookup matrix across all CSS font-weight tiers (w100 to w900).
 * Based on APCA 0.98G spatial frequency curves.
 */
export declare function getExhaustiveApcaFontMatrix(absLc: number): Wcag3FontWeightMatrix;
/**
 * Determine WCAG 3 conformance tier.
 */
export declare function getWcag3Level(absLc: number): Wcag3ConformanceLevel;
/**
 * Exhaustively evaluates a color pair against WCAG 3 / APCA candidate standards.
 */
export declare function evaluateWcag3(textColor: string, bgColor: string): Wcag3EvaluationResult;
