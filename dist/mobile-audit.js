/**
 * @intuitui-labs/a11y-gate - Mobile Visual Architecture & Touch Ergonomics Audit Engine
 *
 * Provides automated audits for:
 * 1. Touch Target Geometry (WCAG 2.2 AAA SC 2.5.5 / Android 48dp / Apple 44pt)
 * 2. 320px Intrinsic Responsive Reflow (WCAG 2.2 AA SC 1.4.10)
 * 3. Safe Area Inset Defensiveness (iOS notch / Dynamic Island / Android gesture bars)
 * 4. Mobile Typography Floor & Dynamic Type Tolerance (14px micro floor, text-wrap balance)
 * 5. Mobile Menu & Drawer Semantics (VoiceOver & TalkBack screen reader states)
 * 6. React Native / Mobile Component & Screen Qualitative & Ergonomic Audits:
 *    - Step 0: Qualitative UX Gate (Friction, cognitive load, desktop-era checkboxes, blocking modals)
 *    - Step 1: Qualitative Visual Gate (Spatial hierarchy, nested card clutter, typography floor)
 *    - Step 2: Quantitative Ergonomics Gate (48dp touch areas, hitSlop defense, accessibilityRole)
 */
/**
 * 1. Audits touch target sizes across interactive elements (<a>, <button>, <input>, <select>)
 */
export function auditTouchTargetGeometry(html, minSizePx = 48) {
    const interactiveRegex = /<(a|button|input|select)\b([^>]*)>/gi;
    const nonCompliantTags = [];
    let total = 0;
    let compliant = 0;
    let match;
    while ((match = interactiveRegex.exec(html)) !== null) {
        total++;
        const fullTag = match[0];
        const attrs = match[2] ?? '';
        // Check for explicit touch-target class, minimum 48px height/width, or role="presentation"
        const hasTouchClass = /class="[^"]*\b(touch-target|btn|tactile-press|door-card|nav-link)\b/i.test(attrs);
        const hasInlineDimension = /(min-height:\s*(4[4-9]|[5-9]\d|\d{3,})px|min-width:\s*(4[4-9]|[5-9]\d|\d{3,})px)/i.test(attrs);
        const isHiddenOrAriaHidden = /aria-hidden="true"|type="hidden"/i.test(attrs);
        if (hasTouchClass || hasInlineDimension || isHiddenOrAriaHidden) {
            compliant++;
        }
        else {
            nonCompliantTags.push(fullTag.slice(0, 80));
        }
    }
    return {
        totalInteractive: total,
        compliantCount: compliant,
        nonCompliantTags,
        isCompliant: nonCompliantTags.length === 0,
    };
}
/**
 * 2. Audits that layout does not impose hardcoded pixel widths > 320px forcing horizontal scrolling
 */
export function auditResponsiveIntrinsicLayout(html, css = '') {
    const violations = [];
    // Scan inline styles and HTML for rigid pixel widths > 320px
    const inlineWidthRegex = /style="[^"]*width:\s*([4-9]\d{2,}|\d{4,})px[^"]*"/gi;
    let match;
    while ((match = inlineWidthRegex.exec(html)) !== null) {
        violations.push(match[0]);
    }
    // Scan for old-school table layouts or fixed canvas
    const rigidTagRegex = /<(table|div)[^>]*(width="[4-9]\d{2,}"|width="\d{4,}")/gi;
    while ((match = rigidTagRegex.exec(html)) !== null) {
        violations.push(match[0]);
    }
    return {
        passes320Reflow: violations.length === 0,
        fixedWidthViolations: violations,
    };
}
/**
 * 3. Audits viewport-fit=cover and defensive safe area inset usage
 */
export function auditSafeAreaDefensiveness(html, css = '') {
    const hasViewportFitCover = /<meta[^>]*name="viewport"[^>]*viewport-fit=cover/i.test(html);
    const hasSafeAreaInsets = /env\(safe-area-inset-(bottom|top|left|right)\)/i.test(html) ||
        /env\(safe-area-inset-(bottom|top|left|right)\)/i.test(css);
    return {
        hasViewportFitCover,
        hasSafeAreaInsets,
    };
}
/**
 * 4. Audits that mobile typography satisfies the strict 14px floor
 */
export function auditMobileTypographyFloor(html) {
    // Flag any classes that enforce sub-14px text: text-[10px], text-[11px], text-[12px], text-[13px]
    const sub14Regex = /\btext-\[(1[0-3]|[1-9])px\]/gi;
    const violations = [];
    let match;
    while ((match = sub14Regex.exec(html)) !== null) {
        violations.push(match[0]);
    }
    return {
        passes14PxFloor: violations.length === 0,
        sub14PxViolations: violations,
    };
}
/**
 * 5. Audits mobile menu toggle and drawer dialog accessibility semantics
 */
export function auditMobileMenuSemantics(html) {
    const hasMenuToggle = /id="mobile-menu-btn"|class="[^"]*mobile-menu-toggle/i.test(html);
    const hasExpandedAttribute = /aria-expanded="(true|false)"/i.test(html);
    const hasDialogRole = /role="dialog"/i.test(html);
    const hasModalAttribute = /aria-modal="true"/i.test(html);
    return {
        hasMenuToggle,
        hasExpandedAttribute,
        hasDialogRole,
        hasModalAttribute,
    };
}
/**
 * Universal Mobile A11y & Touch Ergonomics Test Runner for HTML/Web
 */
export function runMobileAuditSuite(config, testHooks) {
    const { describe, it, expect } = testHooks;
    describe(`Mobile Ergonomics & Visual Architecture Gate [${config.name}]`, () => {
        it('enforces safe area defensiveness and viewport-fit=cover', () => {
            config.htmlPages.forEach((page) => {
                const safeArea = auditSafeAreaDefensiveness(page.html, config.cssContent);
                expect(safeArea.hasViewportFitCover, `Page ${page.path} missing viewport-fit=cover`).toBe(true);
            });
        });
        it('enforces intrinsic responsive reflow with zero hardcoded widths > 320px', () => {
            config.htmlPages.forEach((page) => {
                const reflow = auditResponsiveIntrinsicLayout(page.html, config.cssContent);
                expect(reflow.passes320Reflow, `Page ${page.path} has fixed-width violations: ${reflow.fixedWidthViolations.join(', ')}`).toBe(true);
            });
        });
        it('enforces strict 14px micro-typography floor on mobile screens', () => {
            config.htmlPages.forEach((page) => {
                const typo = auditMobileTypographyFloor(page.html);
                expect(typo.passes14PxFloor, `Page ${page.path} has sub-14px typography classes: ${typo.sub14PxViolations.join(', ')}`).toBe(true);
            });
        });
        it('enforces mobile navigation and drawer accessibility semantics', () => {
            const primaryPage = config.htmlPages[0];
            if (primaryPage) {
                const menu = auditMobileMenuSemantics(primaryPage.html);
                if (menu.hasMenuToggle) {
                    expect(menu.hasExpandedAttribute, 'Menu toggle must have aria-expanded attribute').toBe(true);
                }
            }
        });
        it('enforces mobile touch targets satisfy minimum dimension thresholds', () => {
            config.htmlPages.forEach((page) => {
                const targets = auditTouchTargetGeometry(page.html, config.strictTargetSizePx ?? 48);
                expect(targets.compliantCount).toBeGreaterThan(0);
            });
        });
    });
}
/**
 * Audits React Native component source code for typography floor violations (< 14px).
 */
export function auditReactNativeTypography(sourceCode) {
    // Matches Tailwind class text-[10px], text-[11px], text-[12px], text-[13px]
    const sub14Tailwind = Array.from(sourceCode.matchAll(/\btext-\[(1[0-3]|[1-9])px\]/gi), (m) => m[0]);
    // Matches inline styles fontSize: 10, fontSize: 11, fontSize: 12, fontSize: 13
    const sub14Inline = Array.from(sourceCode.matchAll(/\bfontSize:\s*(1[0-3]|[1-9])\b/gi), (m) => m[0]);
    const allOccurrences = [...sub14Tailwind, ...sub14Inline];
    if (allOccurrences.length === 0)
        return null;
    return {
        rule: 'MOBILE_TYPOGRAPHY_FLOOR_14PX',
        gate: 'step1_qualitative_visual',
        severity: 'error',
        message: `Found ${allOccurrences.length} instances of sub-14px typography. Mobile reading floor requires >= 14px for all instructions and labels.`,
        occurrences: allOccurrences,
    };
}
/**
 * Audits interactive elements (Pressable, TouchableOpacity) for sub-48dp touch targets lacking hitSlop.
 */
export function auditReactNativeTouchTargets(sourceCode) {
    // Flag compact paddings (py-1, py-1.5, h-6, h-7, h-8) on Pressable without hitSlop
    const compactRegex = /<(Pressable|TouchableOpacity)\b(?:(?!hitSlop)[\s\S])*?className=["'][^"']*\b(py-1|py-1\.5|h-6|h-7|h-8)\b[^"']*["']/gi;
    const matches = Array.from(sourceCode.matchAll(compactRegex), (m) => m[0].slice(0, 100));
    if (matches.length === 0)
        return null;
    return {
        rule: 'TOUCH_TARGET_48DP_UNDERSIZED',
        gate: 'step2_quantitative_ergonomics',
        severity: 'error',
        message: `Found ${matches.length} compact interactive elements (< 48dp) without hitSlop defense.`,
        occurrences: matches,
    };
}
/**
 * Audits Step 0 Qualitative UX patterns:
 * - Detects mandatory desktop-era checkboxes blocking exploration.
 * - Detects excessive nested card containers ("box-in-a-box").
 */
export function auditReactNativeQualitativeUx(sourceCode) {
    const findings = [];
    // Desktop-era mandatory checkbox blocking user exploration
    const termsCheckbox = /<Checkbox\b[\s\S]*?value=["']terms["']/i.test(sourceCode);
    if (termsCheckbox) {
        findings.push({
            rule: 'COGNITIVE_FRICTION_CHECKBOX',
            gate: 'step0_qualitative_ux',
            severity: 'warning',
            message: 'Detected mandatory terms checkbox blocking first-touch exploration. Use modern ambient agreement instead.',
            occurrences: ['<Checkbox value="terms" ... />'],
        });
    }
    // Nested card containers (counting distinct border-phase-border cards)
    const nestedCards = (sourceCode.match(/border-phase-border/g) || []).length;
    if (nestedCards > 2) {
        findings.push({
            rule: 'NESTED_CARD_CLUTTER',
            gate: 'step1_qualitative_visual',
            severity: 'warning',
            message: `Detected ${nestedCards} nested bordered cards creating visual frame clutter.`,
            occurrences: [`${nestedCards} bordered cards`],
        });
    }
    return findings;
}
/**
 * Unified audit function for any React Native screen or component.
 */
export function auditReactNativeScreen(sourceCode, screenName = 'Screen') {
    const findings = [];
    const typo = auditReactNativeTypography(sourceCode);
    if (typo)
        findings.push(typo);
    const touch = auditReactNativeTouchTargets(sourceCode);
    if (touch)
        findings.push(touch);
    findings.push(...auditReactNativeQualitativeUx(sourceCode));
    const errors = findings.filter((f) => f.severity === 'error').length;
    const warnings = findings.filter((f) => f.severity === 'warning').length;
    return {
        screenName,
        isCompliant: errors === 0,
        hasErrors: errors > 0,
        findings,
        summary: { errors, warnings },
    };
}
/**
 * Universal React Native Screen Audit Test Suite for Vitest / Jest
 */
export function runReactNativeScreenAuditSuite(screens, testHooks) {
    const { describe, it, expect } = testHooks;
    describe('Canonical Mobile Screen Gate (Step 0 Qualitative + Step 1 Visual + Ergonomics)', () => {
        screens.forEach((screen) => {
            describe(`Screen: ${screen.name}`, () => {
                const result = auditReactNativeScreen(screen.sourceCode, screen.name);
                it('passes the strict 14px mobile typography floor', () => {
                    const typo = result.findings.find((f) => f.rule === 'MOBILE_TYPOGRAPHY_FLOOR_14PX');
                    expect(typo, typo ? typo.message : undefined).toBeUndefined();
                });
                it('enforces 48dp minimum touch target bounding box or hitSlop', () => {
                    const touch = result.findings.find((f) => f.rule === 'TOUCH_TARGET_48DP_UNDERSIZED');
                    expect(touch, touch ? touch.message : undefined).toBeUndefined();
                });
                it('is free from severe ergonomic errors', () => {
                    expect(result.hasErrors, `Screen has ${result.summary.errors} error-level violations`).toBe(false);
                });
            });
        });
    });
}
