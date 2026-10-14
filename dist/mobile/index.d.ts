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
export interface MobileA11yStandards {
    /** Strict Android & Sanctuary touch target floor in density-independent pixels */
    readonly MIN_TOUCH_TARGET_DP: number;
    /** Compact iOS touch target floor in points */
    readonly MIN_TOUCH_TARGET_COMPACT_PT: number;
    /** Absolute legal minimum target size under WCAG 2.2 SC 2.5.8 */
    readonly MIN_TOUCH_TARGET_LEGAL_PX: number;
    /** Recommended minimum reading floor for mobile labels / descriptions */
    readonly MICRO_TYPOGRAPHY_FLOOR_PX: number;
    /** APCA threshold for mobile body / descriptive text */
    readonly APCA_BODY_MIN: number;
    /** APCA threshold for headlines and large interactive buttons */
    readonly APCA_LARGE_MIN: number;
    /** APCA threshold for icons, indicators, and graphics */
    readonly APCA_GRAPHIC_MIN: number;
    /** Maximum supported dynamic font scale before forcing simplified layout */
    readonly MAX_COMFORTABLE_FONT_SCALE: number;
}
export declare const MOBILE_A11Y_STANDARDS: MobileA11yStandards;
export interface TouchHitSlop {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export interface TouchTargetCheckResult {
    passes: boolean;
    actual: {
        width: number;
        height: number;
    };
    required: number;
    deficiency: {
        width: number;
        height: number;
    };
    recommendedHitSlop: TouchHitSlop;
}
/**
 * Validates whether an interactive mobile component meets touch target standards.
 */
export declare function checkMobileTouchTarget(widthDp: number, heightDp: number, standard?: 'strict' | 'compact' | 'legal'): TouchTargetCheckResult;
/**
 * Standard hitSlop calculator to defend touch targets on compact visual icons.
 * Example: for a 24dp icon under strict 48dp target floor, expands hit area by 12dp on each side.
 */
export declare function getTouchHitSlop(visualWidthDp: number, visualHeightDp: number, targetFloorDp?: number): TouchHitSlop;
/**
 * Validates dynamic font scaling tolerance and verifies typography floors.
 */
export declare function validateDynamicTypography(baseFontSizePx: number, scaleFactor?: number, minFloorPx?: number): {
    passesFloor: boolean;
    scaledSizePx: number;
    isComfortable: boolean;
    warning?: string;
};
/**
 * Finds the best text color for a given background from a set of candidate hex colors.
 * Prioritizes absolute APCA score over legacy WCAG ratios.
 */
export declare function getBestText(bg: string, candidates?: readonly string[]): string;
/**
 * Format APCA rating text for mobile components.
 */
export declare function formatApcaRating(score: number): string;
export * from '../mobile-audit.js';
