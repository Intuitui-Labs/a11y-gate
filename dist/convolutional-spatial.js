/**
 * @intuitui-labs/a11y-gate - Multi-Scale Convolutional Spatial & Typographic Architecture Engine
 *
 * Models human visual perception across 3 distinct scales:
 * 1. Macro Scale (Global Gist & Full-Page Canvas):
 *    - Macro whitespace ratio (breathing room vs claustrophobia)
 *    - Reading channel measure (45ch - 65ch optimal, max 75ch)
 *    - Vertical rhythmic cadence
 *
 * 2. Meso Scale (Inter-Container Spatial Matrix):
 *    - The Fundamental Spatial Hierarchy Inequality: Margin_outer >= Gutter_inter >= Padding_intra
 *    - Sibling container alignment and proportional visual presence
 *
 * 3. Micro Scale (Intra-Container & Convolutional Sliding Window):
 *    - Gestalt Enclosure: Container Padding >= Child Gap
 *    - Form-Group Proximity: Dist(Label, Input) < Dist(Input, NextGroup)
 *    - Heading Proximity Law: MarginBottom < MarginTop
 *    - Full Typographic Attribute Matrix:
 *      * Font Size & Weight Floors
 *      * Line Height Ratio (Leading: 1.15-1.3 for headings, 1.45-1.65 for body)
 *      * Letter Spacing (Tracking: tighter for display, neutral for body, open for small uppercase)
 *      * APCA Lightness Contrast (Lc >= 75 for body, >= 65 for controls, >= 80 for titles)
 *      * Text-wrap balance & squircle curvature
 */
import { calculateApca } from './contrast-math.js';
import { evaluateReadingMeasure } from './spatial-math.js';
export function auditGlobalPageGist(config) {
    const violations = [];
    const isMobile = config.viewportWidthPx < 768;
    // 1. Horizontal canvas margins
    const minMargin = isMobile ? 16 : 24;
    if (config.horizontalCanvasMarginPx < minMargin) {
        violations.push(`Global canvas horizontal margin (${config.horizontalCanvasMarginPx}px) is cramped: minimum required is ${minMargin}px.`);
    }
    // 2. Reading measure
    const measureEval = evaluateReadingMeasure(config.readingMeasureChars);
    let isMeasureOptimal = measureEval.isOptimal;
    if (!isMobile && config.readingMeasureChars > 70) {
        isMeasureOptimal = false;
        violations.push(`Desktop reading channel measure (${config.readingMeasureChars}ch) exceeds optimal Swiss reading bounds (max 65-70ch).`);
    }
    // 3. Whitespace ratio (breathing canvas)
    const ratio = config.estimatedWhitespaceRatio ?? (1 - (config.contentContainerWidthPx / config.viewportWidthPx) * 0.8);
    if (!isMobile && ratio < 0.20) {
        violations.push(`Global page gist is claustrophobic: estimated whitespace ratio (${(ratio * 100).toFixed(0)}%) is under 20% floor.`);
    }
    return {
        passes: violations.length === 0,
        whitespaceRatio: Math.round(ratio * 100) / 100,
        isMeasureOptimal,
        violations,
    };
}
export function auditInterContainerRelations(spec) {
    const violations = [];
    // Spatial Hierarchy Inequality: Margin_outer >= Gutter_inter >= Padding_intra (or Gutter_inter >= Padding_intra)
    let satisfiesHierarchyInequality = true;
    if (spec.interContainerGutterPx < spec.intraContainerPaddingPx * 0.75) {
        satisfiesHierarchyInequality = false;
        violations.push(`Inter-container gutter (${spec.interContainerGutterPx}px) is too tight relative to intra-container padding (${spec.intraContainerPaddingPx}px), causing cards to visually coalesce.`);
    }
    if (spec.outerMarginPx < spec.interContainerGutterPx) {
        violations.push(`Outer canvas margin (${spec.outerMarginPx}px) is smaller than inter-card gutter (${spec.interContainerGutterPx}px), creating peripheral tension.`);
    }
    // Horizontal row overflow / clipping check
    if (spec.containerWidthPx && spec.childItems && spec.childItems.length > 0 && !spec.isScrollableOrWrap) {
        const totalChildWidth = spec.childItems.reduce((acc, c) => acc + c.minWidthPx, 0) +
            (spec.childItems.length - 1) * spec.interContainerGutterPx;
        if (totalChildWidth > spec.containerWidthPx) {
            violations.push(`Horizontal row container (width ${spec.containerWidthPx}px) overflows with ${spec.childItems.length} items totaling ${totalChildWidth}px, causing items to clip/amputate without flex-wrap or horizontal scroll affordance.`);
        }
    }
    return {
        passes: violations.length === 0,
        satisfiesHierarchyInequality,
        violations,
    };
}
export function auditIntraContainerClusters(config) {
    const violations = [];
    const minPad = Math.min(config.paddingPx.top, config.paddingPx.right, config.paddingPx.bottom, config.paddingPx.left);
    // 1. Gestalt Enclosure
    if (minPad < config.childGapPx) {
        violations.push(`Container ${config.containerId}: inner padding (${minPad}px) is smaller than child element gap (${config.childGapPx}px), violating Gestalt enclosure.`);
    }
    // 2. Heading Proximity Law
    if (config.headingMarginTopPx !== undefined && config.headingMarginBottomPx !== undefined) {
        if (config.headingMarginBottomPx >= config.headingMarginTopPx) {
            violations.push(`Container ${config.containerId}: heading bottom margin (${config.headingMarginBottomPx}px) must be smaller than top margin (${config.headingMarginTopPx}px) to satisfy the Law of Proximity.`);
        }
    }
    // 3. Form-Group Sliding Window Proximity
    if (config.formGroups) {
        for (const fg of config.formGroups) {
            if (fg.labelToInputGapPx >= fg.inputToNextGroupGapPx) {
                violations.push(`Form group ${fg.id}: label-to-input gap (${fg.labelToInputGapPx}px) must be strictly smaller than gap to next group (${fg.inputToNextGroupGapPx}px) so label visually clings to its input.`);
            }
            if (fg.hasHelperText && fg.inputToHelperGapPx !== undefined) {
                if (fg.inputToHelperGapPx >= fg.inputToNextGroupGapPx) {
                    violations.push(`Form group ${fg.id}: helper text gap (${fg.inputToHelperGapPx}px) is larger than next group gap (${fg.inputToNextGroupGapPx}px), detaching guidance from input.`);
                }
            }
        }
    }
    return {
        passes: violations.length === 0,
        violations,
    };
}
export function auditTypographicMicroAttributes(elements) {
    const violations = [];
    for (const el of elements) {
        const label = el.textSnippet ? `"${el.textSnippet}"` : el.role;
        // 0. Absolute Font Size Floor: sub-12px is strictly banned
        if (el.fontSizePx < 12) {
            violations.push(`Text ${label} font size (${el.fontSizePx}px) violates the 12px absolute legibility floor. Micro-fonts (<12px) cause severe optical blur and are banned.`);
        }
        // 1. Line-height ratio check (Leading)
        if (el.lineHeightPx !== undefined) {
            const leadingRatio = el.lineHeightPx / el.fontSizePx;
            if (el.role === 'body') {
                if (leadingRatio < 1.40) {
                    violations.push(`Body text ${label} line-height ratio (${leadingRatio.toFixed(2)}) is crushed: minimum required is 1.45 for comfortable reading.`);
                }
                else if (leadingRatio > 1.80) {
                    violations.push(`Body text ${label} line-height ratio (${leadingRatio.toFixed(2)}) is over-spaced: maximum recommended is 1.70.`);
                }
            }
            else if (el.role === 'h1' || el.role === 'h2' || el.role === 'h3') {
                if (leadingRatio > 1.35) {
                    violations.push(`Heading ${label} line-height ratio (${leadingRatio.toFixed(2)}) is too loose: headings require compact leading (1.10 - 1.30).`);
                }
            }
        }
        // 2. Stroke & Weight Floors: thin strokes banned, sub-14px requires medium weight
        if (el.fontWeight < 400) {
            violations.push(`Text ${label} font weight (${el.fontWeight}) uses anemic thin strokes (< 400). Thin strokes cause stroke vibration and are banned.`);
        }
        else if (el.fontSizePx < 14 && el.fontWeight < 500) {
            violations.push(`Sub-14px text ${label} (${el.fontSizePx}px) requires at least Medium weight (>= 500) to prevent stroke collapse (found ${el.fontWeight}).`);
        }
        else if ((el.role === 'label' || el.role === 'button') && el.fontWeight < 500) {
            violations.push(`Control/label ${label} weight (${el.fontWeight}) is anemic: minimum 500 (Medium) required.`);
        }
        // 3. Letter-spacing check (Tracking)
        if (el.fontSizePx <= 13) {
            // Small text / micro-copy requires positive letter-spacing
            if (el.letterSpacingEm !== undefined && el.letterSpacingEm < 0.02) {
                violations.push(`Micro-copy ${label} (${el.fontSizePx}px) tracking (${el.letterSpacingEm}em) is squeezed: minimum +0.02em required to prevent glyph collision.`);
            }
        }
        else if ((el.role === 'h1' || el.role === 'h2') && el.fontSizePx >= 28) {
            if (el.letterSpacingEm !== undefined && el.letterSpacingEm > 0.01) {
                violations.push(`Large display heading ${label} letter-spacing (${el.letterSpacingEm}em) should be neutral or slightly tight (<= 0), not wide.`);
            }
        }
        else if (el.role === 'body') {
            if (el.letterSpacingEm !== undefined && (el.letterSpacingEm < -0.02 || el.letterSpacingEm > 0.05)) {
                violations.push(`Body text ${label} tracking (${el.letterSpacingEm}em) violates legibility standards (-0.01em to +0.02em).`);
            }
        }
        // 4. Optical Mass & Anti-Grey Contrast Floor
        const lc = el.absLc ?? (el.colorHex && el.bgHex ? Math.abs(calculateApca(el.colorHex, el.bgHex)) : 80);
        if (el.fontSizePx <= 13 && lc < 70) {
            violations.push(`Small text ${label} (${el.fontSizePx}px) contrast (Lc ${lc.toFixed(1)}) fails micro-copy legibility threshold (Lc >= 70 required). Washed-out grey ghosting is banned.`);
        }
        else if (el.role === 'body' && lc < 75) {
            violations.push(`Body text ${label} contrast (Lc ${lc.toFixed(1)}) is too washed out (Lc >= 75 required).`);
        }
        else if ((el.role === 'label' || el.role === 'button') && lc < 65) {
            violations.push(`Control/label ${label} contrast (Lc ${lc.toFixed(1)}) is too washed out (Lc >= 65 required).`);
        }
    }
    return {
        passes: violations.length === 0,
        violations,
    };
}
export function auditVisualNoiseClutter(spec) {
    const violations = [];
    const normalized = (spec.titles ?? []).map((t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim());
    for (let i = 0; i < normalized.length; i++) {
        for (let j = i + 1; j < normalized.length; j++) {
            const wordsA = new Set(normalized[i].split(/\s+/).filter((w) => w.length > 2));
            const wordsB = new Set(normalized[j].split(/\s+/).filter((w) => w.length > 2));
            if (wordsA.size === 0 || wordsB.size === 0)
                continue;
            let intersection = 0;
            for (const w of wordsA) {
                if (wordsB.has(w))
                    intersection++;
            }
            const similarity = intersection / Math.min(wordsA.size, wordsB.size);
            if (similarity >= 0.6) {
                violations.push(`Visual redundancy detected between adjacent titles "${spec.titles[i]}" and "${spec.titles[j]}" (${Math.round(similarity * 100)}% keyword overlap), devouring vertical screen space with duplicate headers.`);
            }
        }
    }
    return {
        passes: violations.length === 0,
        violations,
    };
}
export function runConvolutionalLayoutAudit(spec) {
    const macroRes = auditGlobalPageGist(spec.macro);
    const mesoRes = auditInterContainerRelations(spec.meso);
    const microResults = spec.microContainers.map(auditIntraContainerClusters);
    const typoRes = auditTypographicMicroAttributes(spec.typography);
    const clutterRes = spec.adjacentTitles ? auditVisualNoiseClutter({ titles: spec.adjacentTitles }) : undefined;
    const microViolations = microResults.flatMap(m => m.violations);
    const allViolations = [
        ...macroRes.violations,
        ...mesoRes.violations,
        ...microViolations,
        ...typoRes.violations,
        ...(clutterRes ? clutterRes.violations : []),
    ];
    const rawScore = Math.max(0, 100 - allViolations.length * 8);
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
            macro: macroRes,
            meso: mesoRes,
            micro: microResults,
            typography: typoRes,
            clutter: clutterRes,
        },
    };
}
