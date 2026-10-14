/**
 * @intuitui-labs/a11y-gate/mobile - Headless Mobile & Touch Ergonomics Infrastructure
 *
 * Provides pure, zero-dependency mathematical models and validators for:
 * 1. Touch Target Geometry (48dp Android / Sanctuary, 44pt iOS, HitSlop generators)
 * 2. Dynamic Type & Font Scaling (Floor of 14px, scale factors up to 2.0x/3.0x)
 * 3. Mobile Ergonomics & Reachability Constants
 * 4. Accessibility Role & Screen Reader Contracts
 * 5. Best Contrast Candidate Color Picker (prioritizing APCA Lc)
 */
import { calculateApca } from '../contrast-math.js';
export const MOBILE_A11Y_STANDARDS = {
    MIN_TOUCH_TARGET_DP: 48,
    MIN_TOUCH_TARGET_COMPACT_PT: 44,
    MIN_TOUCH_TARGET_LEGAL_PX: 24,
    MICRO_TYPOGRAPHY_FLOOR_PX: 14,
    APCA_BODY_MIN: 75,
    APCA_LARGE_MIN: 60,
    APCA_GRAPHIC_MIN: 45,
    MAX_COMFORTABLE_FONT_SCALE: 2.0,
};
/**
 * Validates whether an interactive mobile component meets touch target standards.
 */
export function checkMobileTouchTarget(widthDp, heightDp, standard = 'strict') {
    let required = MOBILE_A11Y_STANDARDS.MIN_TOUCH_TARGET_DP;
    if (standard === 'compact')
        required = MOBILE_A11Y_STANDARDS.MIN_TOUCH_TARGET_COMPACT_PT;
    else if (standard === 'legal')
        required = MOBILE_A11Y_STANDARDS.MIN_TOUCH_TARGET_LEGAL_PX;
    const passes = widthDp >= required && heightDp >= required;
    const deficiency = {
        width: Math.max(0, required - widthDp),
        height: Math.max(0, required - heightDp),
    };
    const padX = Math.ceil(deficiency.width / 2);
    const padY = Math.ceil(deficiency.height / 2);
    return {
        passes,
        actual: { width: widthDp, height: heightDp },
        required,
        deficiency,
        recommendedHitSlop: {
            top: padY,
            bottom: padY,
            left: padX,
            right: padX,
        },
    };
}
/**
 * Standard hitSlop calculator to defend touch targets on compact visual icons.
 * Example: for a 24dp icon under strict 48dp target floor, expands hit area by 12dp on each side.
 */
export function getTouchHitSlop(visualWidthDp, visualHeightDp, targetFloorDp = MOBILE_A11Y_STANDARDS.MIN_TOUCH_TARGET_DP) {
    const padX = Math.max(0, Math.ceil((targetFloorDp - visualWidthDp) / 2));
    const padY = Math.max(0, Math.ceil((targetFloorDp - visualHeightDp) / 2));
    return {
        top: padY,
        bottom: padY,
        left: padX,
        right: padX,
    };
}
/**
 * Validates dynamic font scaling tolerance and verifies typography floors.
 */
export function validateDynamicTypography(baseFontSizePx, scaleFactor = 1.0, minFloorPx = MOBILE_A11Y_STANDARDS.MICRO_TYPOGRAPHY_FLOOR_PX) {
    const scaledSizePx = Math.round(baseFontSizePx * scaleFactor * 10) / 10;
    const passesFloor = baseFontSizePx >= minFloorPx;
    const isComfortable = scaleFactor <= MOBILE_A11Y_STANDARDS.MAX_COMFORTABLE_FONT_SCALE;
    let warning;
    if (!passesFloor) {
        warning = `Base font size (${baseFontSizePx}px) is below minimum readable floor (${minFloorPx}px).`;
    }
    else if (!isComfortable) {
        warning = `Scale factor (${scaleFactor}x) exceeds comfortable mobile layout threshold (2.0x).`;
    }
    return {
        passesFloor,
        scaledSizePx,
        isComfortable,
        warning,
    };
}
/**
 * Finds the best text color for a given background from a set of candidate hex colors.
 * Prioritizes absolute APCA score over legacy WCAG ratios.
 */
export function getBestText(bg, candidates = ['#2A2318', '#FCF9F2', '#FFFFFF', '#000000']) {
    let bestColor = candidates[0] || '#000000';
    let bestApca = -Infinity;
    for (const fg of candidates) {
        const score = Math.abs(calculateApca(fg, bg));
        if (score > bestApca) {
            bestApca = score;
            bestColor = fg;
        }
    }
    return bestColor;
}
/**
 * Format APCA rating text for mobile components.
 */
export function formatApcaRating(score) {
    const abs = Math.abs(score);
    if (abs >= 90)
        return 'Gold (Optimal Body)';
    if (abs >= 75)
        return 'Silver (Fluent Body Minimum)';
    if (abs >= 60)
        return 'Bronze (Headlines & Large Controls)';
    if (abs >= 45)
        return 'Component (Icons & Borders Only)';
    return 'Fail';
}
// Re-export mobile-audit items for direct mobile usage
export * from '../mobile-audit.js';
