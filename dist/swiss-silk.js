/**
 * @intuitui-labs/a11y-gate - Swiss-Silk Unified Architectural Gate
 *
 * Implements:
 * 1. Typographic Purity (Font diversity limits, no monospace controls, 16px mobile input floor, modular scale)
 * 2. Optical Weight & Anti-Ghost-Text (Minimum weights for body/controls, APCA contrast thresholds, anti-washout)
 * 3. Container-Relative Spatial & IA Hierarchy (Gestalt enclosure, heading proximity, optical hierarchy)
 * 4. Visual Noise & Anti-Clutter (Anti-wallpaper, no stacked title clutter, 4px/8px spatial quantum)
 * 5. Tactile Surface & Curvature (Continuous squircle >=16px, soft luminance borders, spring kinetics)
 * 6. Web vs Mobile Ergonomics (Mobile bottom dock, touch envelope >=44px, desktop reading measure <=65ch)
 * 7. Composite Doctrine Orchestrator (auditSwissSilkDoctrine)
 */
import { isValidSpatialQuantum, evaluateReadingMeasure, evaluateTargetSize } from './spatial-math.js';
import { calculateApca } from './contrast-math.js';
export function evaluateTypographicPurity(config) {
    const violations = [];
    const families = config.fontFamilies ?? [];
    const isMobile = (config.viewportWidthPx ?? 1024) < 768;
    // 1. Max font family diversity: <= 2 families
    if (families.length > 2) {
        violations.push(`Font family diversity exceeded: max allowed is 2, found ${families.length}.`);
    }
    // 2. Monospace on interactive controls prohibited
    if (config.controlFontFamilies) {
        const monoRegex = /mono|code|consolas|courier/i;
        for (const [control, font] of Object.entries(config.controlFontFamilies)) {
            if (monoRegex.test(font)) {
                const singular = control.endsWith('s') ? control.slice(0, -1) : control;
                violations.push(`Monospace font cannot be used on interactive controls (${singular}).`);
            }
        }
    }
    // 3. Mobile input font floor >= 16px to prevent iOS auto-zoom
    let passesFloor = true;
    if (isMobile && config.inputFontSizesPx && config.inputFontSizesPx.length > 0) {
        const sub16 = config.inputFontSizesPx.filter(sz => sz < 16);
        if (sub16.length > 0) {
            passesFloor = false;
            violations.push(`Mobile input font size ${Math.min(...sub16)}px violates 16px floor (triggers iOS Safari viewport zoom).`);
        }
    }
    // 4. Modular typographic scale check
    let scaleConformant = true;
    if (config.fontSizesPx && config.fontSizesPx.length >= 3) {
        const sorted = [...new Set(config.fontSizesPx)].sort((a, b) => a - b);
        const validModularRatios = [1.2, 1.25, 1.333];
        const matchesAnyRatio = validModularRatios.some(ratio => {
            for (let i = 0; i < sorted.length - 1; i++) {
                const stepRatio = sorted[i + 1] / sorted[i];
                if (Math.abs(stepRatio - ratio) > 0.06) {
                    return false;
                }
            }
            return true;
        });
        if (!matchesAnyRatio) {
            scaleConformant = false;
            violations.push(`Font sizes [${sorted.join(', ')}px] do not conform to a recognized geometric modular scale (1.20, 1.25, 1.333).`);
        }
    }
    return {
        passes: violations.length === 0,
        passesFloor,
        scaleConformant,
        violations,
    };
}
export function evaluateOpticalLegibility(config) {
    const violations = [];
    const defaultBg = config.defaultBgHex ?? '#0C1017';
    for (const el of config.elements) {
        let lc = el.absLc;
        if (lc === undefined && el.colorHex) {
            lc = Math.abs(calculateApca(el.colorHex, el.bgHex ?? defaultBg));
        }
        const absLc = lc ?? 80;
        // Optical mass: size * (weight / 400)^0.75
        const opticalMass = el.fontSizePx * Math.pow(el.fontWeight / 400, 0.75);
        // 1. Role-specific weight and contrast gates
        if (el.role === 'body') {
            if (el.fontWeight < 400) {
                violations.push(`Body text cannot use thin/light weight (< 400): found ${el.fontWeight}.`);
            }
            if (el.fontSizePx < 14) {
                violations.push(`Body text cannot be sub-14px: found ${el.fontSizePx}px.`);
            }
            if (absLc < 75) {
                violations.push(`Body text contrast is too washed out (Lc ${absLc.toFixed(1)} < 75).`);
            }
        }
        else if (el.role === 'label' || el.role === 'button') {
            if (el.fontWeight < 500) {
                violations.push(`Interactive controls and labels require medium weight (>= 500) to maintain visual affordance: found ${el.fontWeight}.`);
            }
            if (el.fontSizePx < 14) {
                violations.push(`Interactive controls cannot be sub-14px: found ${el.fontSizePx}px.`);
            }
            if (absLc < 65) {
                violations.push(`Interactive control text is too washed out (Lc ${absLc.toFixed(1)} < 65).`);
            }
        }
        else if (el.role === 'h1' || el.role === 'h2' || el.role === 'h3') {
            if (el.fontWeight < 600) {
                violations.push(`Headings require bold/semibold weight (>= 600) for clear IA: found ${el.fontWeight}.`);
            }
            if (absLc < 80) {
                violations.push(`Heading text lacks optical punch (Lc ${absLc.toFixed(1)} < 80).`);
            }
        }
        else if (el.role === 'caption') {
            if (el.fontSizePx < 12) {
                violations.push(`Caption font size cannot be under 12px: found ${el.fontSizePx}px.`);
            }
            if (el.fontSizePx < 14 && el.fontWeight < 500) {
                violations.push(`Sub-14px caption text requires medium weight (>= 500) to avoid optical stroke collapse.`);
            }
            if (absLc < 60) {
                violations.push(`Caption text is too low contrast (Lc ${absLc.toFixed(1)} < 60).`);
            }
        }
    }
    return {
        passes: violations.length === 0,
        violations,
    };
}
export function evaluateContainerHierarchy(config) {
    const violations = [];
    for (const c of config.containers) {
        // 1. Gestalt enclosure: Padding >= Gap
        const minPadding = Math.min(c.paddingPx.top, c.paddingPx.right, c.paddingPx.bottom, c.paddingPx.left);
        if (minPadding < c.innerGapPx) {
            violations.push(`Container ${c.id}: inner padding (${minPadding}px) is smaller than child gap (${c.innerGapPx}px), violating Gestalt enclosure.`);
        }
        // 2. Law of proximity for headings: bottom margin < top margin
        if (c.headingTopMarginPx !== undefined && c.headingBottomMarginPx !== undefined) {
            if (c.headingBottomMarginPx >= c.headingTopMarginPx) {
                violations.push(`Container ${c.id}: heading bottom margin (${c.headingBottomMarginPx}px) must be smaller than top margin (${c.headingTopMarginPx}px) to satisfy the Law of Proximity.`);
            }
        }
        // 3. Information architecture: title mass > body mass
        if (c.titleOpticalMass !== undefined && c.bodyOpticalMass !== undefined) {
            if (c.titleOpticalMass <= c.bodyOpticalMass) {
                violations.push(`Container ${c.id}: title optical mass (${c.titleOpticalMass}) must be greater than body optical mass (${c.bodyOpticalMass}) to maintain Information Architecture.`);
            }
        }
    }
    return {
        passes: violations.length === 0,
        violations,
    };
}
export function evaluateVisualNoise(config) {
    const violations = [];
    // 1. Literal grid wallpaper detection
    let hasLiteralGridWallpaper = false;
    const gridPatternRegex = /(linear-gradient([^)]*(1px|2px)[^)]*)|svg-grid|tech-grid|blueprint-grid)/i;
    for (const bg of config.backgroundStyles) {
        if (gridPatternRegex.test(bg)) {
            hasLiteralGridWallpaper = true;
            violations.push('Literal wallpaper grid lines detected. Swiss grids must remain invisible.');
            break;
        }
    }
    // 2. Technical crosshairs detection
    if (config.hasCrosshairs) {
        violations.push('Decorative technical crosshairs or HUD markers detected.');
    }
    // 3. Redundant title stacking
    if ((config.stackedHeadersCount ?? 0) >= 3) {
        violations.push(`Redundant title stacking detected: ${config.stackedHeadersCount} consecutive headers without intervening content.`);
    }
    // 4. Spatial quantum verification
    let passesSpatialQuantum = true;
    if (config.spacingsPx && config.spacingsPx.length > 0) {
        const invalid = config.spacingsPx.filter(px => !isValidSpatialQuantum(px));
        if (invalid.length > 0) {
            passesSpatialQuantum = false;
            violations.push(`Spatial quantum violation: spacing values [${invalid.join(', ')}px] are not multiples of 4px.`);
        }
    }
    return {
        passes: violations.length === 0,
        hasLiteralGridWallpaper,
        passesSpatialQuantum,
        violations,
    };
}
export function evaluateSurfaceCurvature(config) {
    const violations = [];
    // 1. Continuous squircle curvature (>= 16px) on elevated surfaces
    let isSquircleConformant = true;
    if (config.isElevatedSurface && config.containerBorderRadiusPx < 16) {
        isSquircleConformant = false;
        violations.push(`Surface curvature too harsh: expected squircle >= 16px for elevated container, found ${config.containerBorderRadiusPx}px.`);
    }
    // 2. Soft luminance boundary (borderAlpha <= 0.15) over harsh opaque border
    if (config.isElevatedSurface && config.borderAlpha > 0.15) {
        violations.push(`Harsh opaque border detected (alpha ${config.borderAlpha}): elevated surfaces require soft luminance boundaries (alpha <= 0.15).`);
    }
    // 3. Spring physics timing function
    let isSpringConformant = true;
    const timing = config.transitionTimingFunction.toLowerCase();
    if (timing === 'linear' || timing.includes('steps(')) {
        isSpringConformant = false;
        violations.push('Linear transition violates organic spring physics.');
    }
    return {
        passes: violations.length === 0,
        isSquircleConformant,
        isSpringConformant,
        violations,
    };
}
export function evaluateErgonomicPosture(config) {
    const violations = [];
    const isMobile = config.viewportWidthPx < 768;
    if (isMobile) {
        // 1. Bottom thumb-zone dock on mobile
        if (config.primaryActionDock !== 'bottom-dock') {
            violations.push('Mobile primary action must be bottom-anchored within thumb reach zone.');
        }
        // 2. Minimum touch envelope >= 44px (Apple HIG / WCAG 2.2 AAA)
        const targetEval = evaluateTargetSize(config.minTouchTargetPx, config.minTouchTargetPx);
        if (!targetEval.passesAaa) {
            violations.push(`Touch target size ${config.minTouchTargetPx}px fails Apple HIG / WCAG 2.2 AAA minimum envelope of 44px.`);
        }
        // 3. Single-column flow
        if (!config.isSingleColumnFlow) {
            violations.push('Mobile viewport must enforce single-column vertical flow.');
        }
    }
    else {
        // Desktop:
        const measure = evaluateReadingMeasure(config.readingMeasureCh);
        if (measure.isTooWide || config.readingMeasureCh > 65) {
            violations.push(`Reading measure ${config.readingMeasureCh}ch exceeds optimal Swiss reading bounds (max 65ch).`);
        }
    }
    return {
        passes: violations.length === 0,
        violations,
    };
}
export function auditSwissSilkDoctrine(spec) {
    const typo = evaluateTypographicPurity(spec.typography);
    const noise = evaluateVisualNoise(spec.visualNoise);
    const surface = evaluateSurfaceCurvature(spec.surface);
    const ergo = evaluateErgonomicPosture(spec.ergonomics);
    const optical = spec.opticalLegibility ? evaluateOpticalLegibility(spec.opticalLegibility) : undefined;
    const container = spec.containers ? evaluateContainerHierarchy(spec.containers) : undefined;
    const allViolations = [
        ...typo.violations,
        ...noise.violations,
        ...surface.violations,
        ...ergo.violations,
        ...(optical?.violations ?? []),
        ...(container?.violations ?? []),
    ];
    // Scoring: 100 points, each violation subtracts 10 points
    const rawScore = Math.max(0, 100 - allViolations.length * 10);
    const isCompliant = allViolations.length === 0;
    let grade = 'F';
    if (rawScore >= 95)
        grade = 'AAA';
    else if (rawScore >= 80)
        grade = 'AA';
    else if (rawScore >= 60)
        grade = 'A';
    return {
        name: spec.name,
        isCompliant,
        score: rawScore,
        grade,
        violations: allViolations,
        subsystemResults: {
            typography: typo,
            visualNoise: noise,
            surface,
            ergonomics: ergo,
            opticalLegibility: optical,
            containers: container,
        },
    };
}
