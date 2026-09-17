/**
 * @intuitui/a11y-gate - Contrast Mathematics Engine
 * Implements:
 * 1. WCAG 2.1 / 2.2 Relative Luminance & Contrast Ratio (ISO 9241-306 / W3C)
 * 2. W3C APCA 0.98G (Accessible Perceptual Contrast Algorithm - WCAG 3 Candidate)
 * 3. W3C APCA Font Lookup Matrix
 * 4. CIE76 Delta E Color Distance
 */
export function hexToRgb(hex) {
    const cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length === 3) {
        const r = cleanHex[0] ?? '0';
        const g = cleanHex[1] ?? '0';
        const b = cleanHex[2] ?? '0';
        return {
            r: parseInt(r + r, 16),
            g: parseInt(g + g, 16),
            b: parseInt(b + b, 16),
            a: 1,
        };
    }
    if (cleanHex.length === 6) {
        return {
            r: parseInt(cleanHex.substring(0, 2), 16),
            g: parseInt(cleanHex.substring(2, 4), 16),
            b: parseInt(cleanHex.substring(4, 6), 16),
            a: 1,
        };
    }
    if (cleanHex.length === 8) {
        return {
            r: parseInt(cleanHex.substring(0, 2), 16),
            g: parseInt(cleanHex.substring(2, 4), 16),
            b: parseInt(cleanHex.substring(4, 6), 16),
            a: parseInt(cleanHex.substring(6, 8), 16) / 255,
        };
    }
    throw new Error(`Invalid hex color: ${hex}`);
}
export function rgbToHex(rgb) {
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}
export function blendAlpha(fg, bg) {
    const a = fg.a ?? 1;
    return {
        r: Math.round(fg.r * a + bg.r * (1 - a)),
        g: Math.round(fg.g * a + bg.g * (1 - a)),
        b: Math.round(fg.b * a + bg.b * (1 - a)),
        a: 1,
    };
}
export function sRgbToLinear(c255) {
    const c = c255 / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
export function getRelativeLuminance(rgb) {
    const rLin = sRgbToLinear(rgb.r);
    const gLin = sRgbToLinear(rgb.g);
    const bLin = sRgbToLinear(rgb.b);
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}
export function getWcagContrastRatio(color1, color2) {
    const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;
    const lum1 = getRelativeLuminance(rgb1);
    const lum2 = getRelativeLuminance(rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    return Math.round(ratio * 100) / 100;
}
export function evaluateWcag(textColor, bgColor) {
    const ratio = getWcagContrastRatio(textColor, bgColor);
    return {
        ratio,
        passesAaNormal: ratio >= 4.5,
        passesAaLarge: ratio >= 3.0,
        passesAaaNormal: ratio >= 7.0,
        passesAaaLarge: ratio >= 4.5,
        passesUiComponent: ratio >= 3.0,
    };
}
// APCA 0.98G Constants
const sRco = 0.2126729;
const sGco = 0.7151522;
const sBco = 0.0721750;
const normBG = 0.56;
const normTXT = 0.57;
const revTXT = 0.62;
const revBG = 0.65;
const blkThrs = 0.022;
const blkClp = 1.414;
const deltaYmin = 0.0005;
const scaleBoW = 1.14;
const scaleWoB = 1.14;
const loClip = 0.1;
function apcaLinear(c255) {
    return Math.pow(c255 / 255, 2.4);
}
export function getApcaY(rgb) {
    return (sRco * apcaLinear(rgb.r) +
        sGco * apcaLinear(rgb.g) +
        sBco * apcaLinear(rgb.b));
}
export function calculateApca(textColor, bgColor) {
    const txt = typeof textColor === 'string' ? hexToRgb(textColor) : textColor;
    const bg = typeof bgColor === 'string' ? hexToRgb(bgColor) : bgColor;
    let yTxt = getApcaY(txt);
    let yBg = getApcaY(bg);
    if (yTxt <= blkThrs) {
        yTxt += Math.pow(blkThrs - yTxt, blkClp);
    }
    if (yBg <= blkThrs) {
        yBg += Math.pow(blkThrs - yBg, blkClp);
    }
    if (Math.abs(yBg - yTxt) < deltaYmin) {
        return 0;
    }
    let sapc = 0;
    if (yBg > yTxt) {
        const sBg = Math.pow(yBg, normBG);
        const sTxt = Math.pow(yTxt, normTXT);
        sapc = (sBg - sTxt) * scaleBoW;
    }
    else {
        const sBg = Math.pow(yBg, revBG);
        const sTxt = Math.pow(yTxt, revTXT);
        sapc = (sBg - sTxt) * scaleWoB;
    }
    if (Math.abs(sapc) < loClip) {
        return 0;
    }
    return Math.round(sapc * 100 * 10) / 10;
}
export function evaluateApca(textColor, bgColor) {
    const lc = calculateApca(textColor, bgColor);
    const absLc = Math.abs(lc);
    let min400 = 999;
    let min700 = 999;
    if (absLc >= 90) {
        min400 = 14;
        min700 = 12;
    }
    else if (absLc >= 75) {
        min400 = 16;
        min700 = 14;
    }
    else if (absLc >= 60) {
        min400 = 24;
        min700 = 18;
    }
    else if (absLc >= 45) {
        min400 = 36;
        min700 = 24;
    }
    else if (absLc >= 30) {
        min400 = 48;
        min700 = 32;
    }
    return {
        lc,
        absLc,
        minFontSizeAt400: min400,
        minFontSizeAt700: min700,
        passesBodyText: absLc >= 75,
        passesLargeText: absLc >= 60,
        passesFineText: absLc >= 90,
    };
}
export function getApcaFontMatrix(absLc) {
    if (absLc >= 90) {
        return { w100: 48, w200: 36, w300: 24, w400: 14, w500: 13, w600: 12, w700: 11, w800: 10, w900: 10 };
    }
    if (absLc >= 75) {
        return { w100: 60, w200: 42, w300: 28, w400: 16, w500: 15, w600: 14, w700: 13, w800: 12, w900: 12 };
    }
    if (absLc >= 60) {
        return { w100: 84, w200: 60, w300: 36, w400: 24, w500: 21, w600: 19, w700: 18, w800: 16, w900: 16 };
    }
    if (absLc >= 45) {
        return { w100: null, w200: 84, w300: 48, w400: 36, w500: 32, w600: 28, w700: 24, w800: 21, w900: 21 };
    }
    if (absLc >= 30) {
        return { w100: null, w200: null, w300: 72, w400: 54, w500: 48, w600: 40, w700: 36, w800: 32, w900: 32 };
    }
    return { w100: null, w200: null, w300: null, w400: null, w500: null, w600: null, w700: null, w800: null, w900: null };
}
export function getDeltaE(color1, color2) {
    const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;
    const dr = rgb1.r - rgb2.r;
    const dg = rgb1.g - rgb2.g;
    const db = rgb1.b - rgb2.b;
    return Math.round(Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db) * 10) / 10;
}
/**
 * Standardize hex color string.
 */
export function toHex(color) {
    try {
        const rgb = hexToRgb(color);
        return rgbToHex(rgb);
    }
    catch {
        return color.startsWith('#') ? color : `#${color}`;
    }
}
/**
 * APCA Contrast calculation.
 * Returns a score between -108 and 106.
 */
export function getAPCAContrast(fg, bg) {
    try {
        return calculateApca(fg, bg);
    }
    catch {
        return 0;
    }
}
/**
 * APCA Level Rating based on score.
 * Lc 90: Preferred for body text.
 * Lc 75: Minimum for body text.
 * Lc 60: Minimum for large text / headlines.
 * Lc 45: Minimum for non-text graphics.
 */
export function getAPCARating(score) {
    const abs = Math.abs(score);
    if (abs >= 90)
        return 'Silver/Gold (Excellent)';
    if (abs >= 75)
        return 'Bronze (Body Text Minimum)';
    if (abs >= 60)
        return 'Large Text Minimum';
    if (abs >= 45)
        return 'Graphic/UI Only';
    return 'Fail';
}
/**
 * Unified accessibility check against WCAG 2.2 and WCAG 3 / APCA.
 */
export function checkAccessibility(fg, bg) {
    let ratio = 1;
    let apca = 0;
    try {
        ratio = getWcagContrastRatio(fg, bg);
        apca = calculateApca(fg, bg);
    }
    catch (err) {
        // Return safe default
    }
    return {
        ratio,
        apca,
        passesAA: ratio >= 4.5,
        passesAAA: ratio >= 7.0,
        apcaRating: getAPCARating(apca),
    };
}
