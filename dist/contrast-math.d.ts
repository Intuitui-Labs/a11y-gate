/**
 * @intuitui/a11y-gate - Contrast Mathematics Engine
 * Implements:
 * 1. WCAG 2.1 / 2.2 Relative Luminance & Contrast Ratio (ISO 9241-306 / W3C)
 * 2. W3C APCA 0.98G (Accessible Perceptual Contrast Algorithm - WCAG 3 Candidate)
 * 3. W3C APCA Font Lookup Matrix
 * 4. CIE76 Delta E Color Distance
 */
export interface RGB {
    r: number;
    g: number;
    b: number;
    a?: number;
}
export declare function hexToRgb(hex: string): RGB;
export declare function rgbToHex(rgb: RGB): string;
export declare function blendAlpha(fg: RGB, bg: RGB): RGB;
export declare function sRgbToLinear(c255: number): number;
export declare function getRelativeLuminance(rgb: RGB): number;
export declare function getWcagContrastRatio(color1: RGB | string, color2: RGB | string): number;
export interface WcagRating {
    ratio: number;
    passesAaNormal: boolean;
    passesAaLarge: boolean;
    passesAaaNormal: boolean;
    passesAaaLarge: boolean;
    passesUiComponent: boolean;
}
export declare function evaluateWcag(textColor: RGB | string, bgColor: RGB | string): WcagRating;
export declare function getApcaY(rgb: RGB): number;
export declare function calculateApca(textColor: RGB | string, bgColor: RGB | string): number;
export interface ApcaEvaluation {
    lc: number;
    absLc: number;
    minFontSizeAt400: number;
    minFontSizeAt700: number;
    passesBodyText: boolean;
    passesLargeText: boolean;
    passesFineText: boolean;
}
export declare function evaluateApca(textColor: RGB | string, bgColor: RGB | string): ApcaEvaluation;
export interface ApcaFontMatrix {
    w100: number | null;
    w200: number | null;
    w300: number | null;
    w400: number | null;
    w500: number | null;
    w600: number | null;
    w700: number | null;
    w800: number | null;
    w900: number | null;
}
export declare function getApcaFontMatrix(absLc: number): ApcaFontMatrix;
export declare function getDeltaE(color1: RGB | string, color2: RGB | string): number;
export interface ContrastResult {
    ratio: number;
    apca: number;
    passesAA: boolean;
    passesAAA: boolean;
    apcaRating: string;
}
/**
 * Standardize hex color string.
 */
export declare function toHex(color: string): string;
/**
 * APCA Contrast calculation.
 * Returns a score between -108 and 106.
 */
export declare function getAPCAContrast(fg: string, bg: string): number;
/**
 * APCA Level Rating based on score.
 * Lc 90: Preferred for body text.
 * Lc 75: Minimum for body text.
 * Lc 60: Minimum for large text / headlines.
 * Lc 45: Minimum for non-text graphics.
 */
export declare function getAPCARating(score: number): string;
/**
 * Unified accessibility check against WCAG 2.2 and WCAG 3 / APCA.
 */
export declare function checkAccessibility(fg: string, bg: string): ContrastResult;
