import { describe, it, expect } from 'vitest';
import {
  evaluateTypographicPurity,
  evaluateVisualNoise,
  evaluateSurfaceCurvature,
  evaluateErgonomicPosture,
  evaluateOpticalLegibility,
  evaluateContainerHierarchy,
  auditSwissSilkDoctrine,
  type TypographicPurityConfig,
  type VisualNoiseConfig,
  type SurfaceCurvatureConfig,
  type ErgonomicPostureConfig,
  type OpticalLegibilityConfig,
  type ContainerHierarchyConfig,
  type SwissSilkAuditSpec,
} from '../src/swiss-silk';

describe('Swiss-Silk Doctrine: Typographic Purity Gate', () => {
  it('rejects interface with > 2 font families (AI font soup)', () => {
    const config: TypographicPurityConfig = {
      fontFamilies: ['Plus Jakarta Sans', 'Fraunces', 'Space Mono', 'Inter'],
      controlFontFamilies: { buttons: 'Space Mono', badges: 'Fraunces' },
      inputFontSizesPx: [16, 16],
      viewportWidthPx: 390,
    };
    const result = evaluateTypographicPurity(config);
    expect(result.passes).toBe(false);
    expect(result.violations).toContain('Font family diversity exceeded: max allowed is 2, found 4.');
  });

  it('accepts interface with single sans or sans + code mono', () => {
    const config: TypographicPurityConfig = {
      fontFamilies: ['Plus Jakarta Sans', 'JetBrains Mono'],
      monoUsage: 'code-only',
      controlFontFamilies: { buttons: 'Plus Jakarta Sans', badges: 'Plus Jakarta Sans' },
      inputFontSizesPx: [16, 16],
      viewportWidthPx: 390,
    };
    const result = evaluateTypographicPurity(config);
    expect(result.passes).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  it('rejects monospace applied to interactive controls (buttons, badges)', () => {
    const config: TypographicPurityConfig = {
      fontFamilies: ['Plus Jakarta Sans', 'JetBrains Mono'],
      controlFontFamilies: { buttons: 'JetBrains Mono' },
      inputFontSizesPx: [16],
      viewportWidthPx: 1024,
    };
    const result = evaluateTypographicPurity(config);
    expect(result.passes).toBe(false);
    expect(result.violations).toContain('Monospace font cannot be used on interactive controls (button).');
  });

  it('enforces 16px mobile input font floor to eliminate iOS Safari auto-zoom', () => {
    const failingConfig: TypographicPurityConfig = {
      fontFamilies: ['Plus Jakarta Sans'],
      controlFontFamilies: { buttons: 'Plus Jakarta Sans' },
      inputFontSizesPx: [13, 14, 16],
      viewportWidthPx: 390,
    };
    const failingResult = evaluateTypographicPurity(failingConfig);
    expect(failingResult.passes).toBe(false);
    expect(failingResult.violations.some(v => v.includes('16px floor'))).toBe(true);

    const passingConfig: TypographicPurityConfig = {
      fontFamilies: ['Plus Jakarta Sans'],
      controlFontFamilies: { buttons: 'Plus Jakarta Sans' },
      inputFontSizesPx: [16, 18],
      viewportWidthPx: 390,
    };
    const passingResult = evaluateTypographicPurity(passingConfig);
    expect(passingResult.passesFloor).toBe(true);
  });

  it('validates modular typographic scale conformance', () => {
    const validSizes = [13, 16, 20, 25, 31];
    const invalidSizes = [11, 13, 17, 23, 29];

    const configValid: TypographicPurityConfig = {
      fontFamilies: ['Plus Jakarta Sans'],
      controlFontFamilies: {},
      fontSizesPx: validSizes,
      inputFontSizesPx: [16],
      viewportWidthPx: 1280,
    };
    expect(evaluateTypographicPurity(configValid).scaleConformant).toBe(true);

    const configInvalid: TypographicPurityConfig = {
      fontFamilies: ['Plus Jakarta Sans'],
      controlFontFamilies: {},
      fontSizesPx: invalidSizes,
      inputFontSizesPx: [16],
      viewportWidthPx: 1280,
    };
    expect(evaluateTypographicPurity(configInvalid).scaleConformant).toBe(false);
  });
});

describe('Swiss-Silk Doctrine: Optical Weight & Anti-Ghost-Text Gate', () => {
  it('rejects thin/light weights (< 400) on body copy', () => {
    const config: OpticalLegibilityConfig = {
      elements: [
        { role: 'body', fontSizePx: 16, fontWeight: 300, absLc: 85, textSnippet: 'Light body copy' },
      ],
    };
    const result = evaluateOpticalLegibility(config);
    expect(result.passes).toBe(false);
    expect(result.violations).toContain('Body text cannot use thin/light weight (< 400): found 300.');
  });

  it('rejects anemic weights (< 500) on interactive buttons and labels', () => {
    const config: OpticalLegibilityConfig = {
      elements: [
        { role: 'button', fontSizePx: 16, fontWeight: 400, absLc: 75, textSnippet: 'Submit' },
      ],
    };
    const result = evaluateOpticalLegibility(config);
    expect(result.passes).toBe(false);
    expect(result.violations).toContain('Interactive controls and labels require medium weight (>= 500) to maintain visual affordance: found 400.');
  });

  it('rejects washed-out muted grey ghost text on body and guidance', () => {
    const config: OpticalLegibilityConfig = {
      elements: [
        { role: 'body', fontSizePx: 16, fontWeight: 400, absLc: 50, textSnippet: 'Washed out gray text' }, // Lc 50 is too low for body
      ],
    };
    const result = evaluateOpticalLegibility(config);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('Body text contrast is too washed out'))).toBe(true);
  });

  it('enforces optical thickness on sub-14px micro copy (requires weight >= 500)', () => {
    const weakMicro: OpticalLegibilityConfig = {
      elements: [
        { role: 'caption', fontSizePx: 12, fontWeight: 400, absLc: 70, textSnippet: 'Tiny thin caption' },
      ],
    };
    expect(evaluateOpticalLegibility(weakMicro).passes).toBe(false);

    const solidMicro: OpticalLegibilityConfig = {
      elements: [
        { role: 'caption', fontSizePx: 13, fontWeight: 500, absLc: 70, textSnippet: 'Solid micro text' },
      ],
    };
    expect(evaluateOpticalLegibility(solidMicro).passes).toBe(true);
  });
});

describe('Swiss-Silk Doctrine: Container-Relative Spatial & IA Hierarchy Gate', () => {
  it('enforces Gestalt enclosure: container padding must be >= internal child gap', () => {
    const leakingContainer: ContainerHierarchyConfig = {
      containers: [
        {
          id: 'card-1',
          type: 'card',
          paddingPx: { top: 8, right: 8, bottom: 8, left: 8 }, // 8px padding
          innerGapPx: 20, // 20px gap causes children to visually escape
        },
      ],
    };
    const resLeaking = evaluateContainerHierarchy(leakingContainer);
    expect(resLeaking.passes).toBe(false);
    expect(resLeaking.violations).toContain('Container card-1: inner padding (8px) is smaller than child gap (20px), violating Gestalt enclosure.');

    const enclosedContainer: ContainerHierarchyConfig = {
      containers: [
        {
          id: 'card-1',
          type: 'card',
          paddingPx: { top: 24, right: 24, bottom: 24, left: 24 },
          innerGapPx: 16,
        },
      ],
    };
    expect(evaluateContainerHierarchy(enclosedContainer).passes).toBe(true);
  });

  it('enforces the Law of Proximity for headings: marginBottom must be < marginTop', () => {
    const disconnectedHeading: ContainerHierarchyConfig = {
      containers: [
        {
          id: 'form-group',
          type: 'form-group',
          paddingPx: { top: 16, right: 16, bottom: 16, left: 16 },
          innerGapPx: 12,
          headingTopMarginPx: 8,
          headingBottomMarginPx: 24, // Heading is further from its content than previous section!
        },
      ],
    };
    const res = evaluateContainerHierarchy(disconnectedHeading);
    expect(res.passes).toBe(false);
    expect(res.violations).toContain('Container form-group: heading bottom margin (24px) must be smaller than top margin (8px) to satisfy the Law of Proximity.');
  });

  it('enforces Information Architecture: title optical mass must exceed body optical mass', () => {
    const invertedIA: ContainerHierarchyConfig = {
      containers: [
        {
          id: 'card-ia',
          type: 'card',
          paddingPx: { top: 24, right: 24, bottom: 24, left: 24 },
          innerGapPx: 16,
          titleOpticalMass: 14, // Title is smaller/lighter than body!
          bodyOpticalMass: 18,
        },
      ],
    };
    const res = evaluateContainerHierarchy(invertedIA);
    expect(res.passes).toBe(false);
    expect(res.violations).toContain('Container card-ia: title optical mass (14) must be greater than body optical mass (18) to maintain Information Architecture.');
  });
});

describe('Swiss-Silk Doctrine: Visual Noise & Anti-Clutter Gate', () => {
  it('rejects literal background wallpaper grids and technical crosshairs', () => {
    const noisyConfig: VisualNoiseConfig = {
      backgroundStyles: [
        'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
        'svg-grid-pattern',
      ],
      hasCrosshairs: true,
      stackedHeadersCount: 1,
      spacingsPx: [16, 24, 32],
    };
    const result = evaluateVisualNoise(noisyConfig);
    expect(result.passes).toBe(false);
    expect(result.hasLiteralGridWallpaper).toBe(true);
    expect(result.violations).toContain('Literal wallpaper grid lines detected. Swiss grids must remain invisible.');
    expect(result.violations).toContain('Decorative technical crosshairs or HUD markers detected.');
  });

  it('accepts clean surfaces with ambient radial blur or solid canvas', () => {
    const cleanConfig: VisualNoiseConfig = {
      backgroundStyles: [
        'radial-gradient(350px circle at 50% 50%, rgba(56, 189, 248, 0.05) 0%, transparent 80%)',
        '#0C1017',
      ],
      hasCrosshairs: false,
      stackedHeadersCount: 1,
      spacingsPx: [16, 24, 32],
    };
    const result = evaluateVisualNoise(cleanConfig);
    expect(result.passes).toBe(true);
    expect(result.hasLiteralGridWallpaper).toBe(false);
  });

  it('rejects triple-stacked redundant titles (AI title sprawl)', () => {
    const clutteredConfig: VisualNoiseConfig = {
      backgroundStyles: ['#0C1017'],
      hasCrosshairs: false,
      stackedHeadersCount: 3,
      spacingsPx: [16, 24],
    };
    const result = evaluateVisualNoise(clutteredConfig);
    expect(result.passes).toBe(false);
    expect(result.violations).toContain('Redundant title stacking detected: 3 consecutive headers without intervening content.');
  });

  it('verifies 4px/8px spatial interval quantum compliance', () => {
    const validConfig: VisualNoiseConfig = {
      backgroundStyles: ['#0C1017'],
      hasCrosshairs: false,
      stackedHeadersCount: 1,
      spacingsPx: [8, 16, 24, 32, 48],
    };
    expect(evaluateVisualNoise(validConfig).passesSpatialQuantum).toBe(true);

    const invalidConfig: VisualNoiseConfig = {
      backgroundStyles: ['#0C1017'],
      hasCrosshairs: false,
      stackedHeadersCount: 1,
      spacingsPx: [8, 15, 23, 32],
    };
    const res = evaluateVisualNoise(invalidConfig);
    expect(res.passesSpatialQuantum).toBe(false);
    expect(res.violations.some(v => v.includes('Spatial quantum violation'))).toBe(true);
  });
});

describe('Swiss-Silk Doctrine: Tactile Surface & Continuous Curvature Gate', () => {
  it('enforces continuous squircle curvature (>= 16px) on primary cards', () => {
    const harshCard: SurfaceCurvatureConfig = {
      containerBorderRadiusPx: 2,
      isElevatedSurface: true,
      borderAlpha: 0.08,
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    };
    const resHarsh = evaluateSurfaceCurvature(harshCard);
    expect(resHarsh.passes).toBe(false);
    expect(resHarsh.violations).toContain('Surface curvature too harsh: expected squircle >= 16px for elevated container, found 2px.');

    const squircleCard: SurfaceCurvatureConfig = {
      containerBorderRadiusPx: 24,
      isElevatedSurface: true,
      borderAlpha: 0.08,
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    };
    const resSquircle = evaluateSurfaceCurvature(squircleCard);
    expect(resSquircle.passes).toBe(true);
    expect(resSquircle.isSquircleConformant).toBe(true);
  });

  it('rejects harsh 1px solid opaque borders on elevated surfaces', () => {
    const harshBorder: SurfaceCurvatureConfig = {
      containerBorderRadiusPx: 20,
      isElevatedSurface: true,
      borderAlpha: 1.0,
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    };
    const res = evaluateSurfaceCurvature(harshBorder);
    expect(res.passes).toBe(false);
    expect(res.violations).toContain('Harsh opaque border detected (alpha 1): elevated surfaces require soft luminance boundaries (alpha <= 0.15).');
  });

  it('validates spring bezier curve against calibrated presets', () => {
    const validCurve: SurfaceCurvatureConfig = {
      containerBorderRadiusPx: 20,
      isElevatedSurface: true,
      borderAlpha: 0.08,
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    };
    expect(evaluateSurfaceCurvature(validCurve).isSpringConformant).toBe(true);

    const harshLinear: SurfaceCurvatureConfig = {
      containerBorderRadiusPx: 20,
      isElevatedSurface: true,
      borderAlpha: 0.08,
      transitionTimingFunction: 'linear',
    };
    const resLinear = evaluateSurfaceCurvature(harshLinear);
    expect(resLinear.isSpringConformant).toBe(false);
    expect(resLinear.violations).toContain('Linear transition violates organic spring physics.');
  });
});

describe('Swiss-Silk Doctrine: Web vs. Mobile Ergonomic Posture Gate', () => {
  it('enforces mobile bottom thumb-zone dock for primary actions on < 768px viewports', () => {
    const mobileMisplaced: ErgonomicPostureConfig = {
      viewportWidthPx: 390,
      primaryActionDock: 'top-nav',
      minTouchTargetPx: 48,
      readingMeasureCh: 50,
      isSingleColumnFlow: true,
    };
    const resMisplaced = evaluateErgonomicPosture(mobileMisplaced);
    expect(resMisplaced.passes).toBe(false);
    expect(resMisplaced.violations).toContain('Mobile primary action must be bottom-anchored within thumb reach zone.');

    const mobileDocked: ErgonomicPostureConfig = {
      viewportWidthPx: 390,
      primaryActionDock: 'bottom-dock',
      minTouchTargetPx: 48,
      readingMeasureCh: 50,
      isSingleColumnFlow: true,
    };
    expect(evaluateErgonomicPosture(mobileDocked).passes).toBe(true);
  });

  it('enforces minimum touch envelope >= 44px on mobile', () => {
    const smallTouch: ErgonomicPostureConfig = {
      viewportWidthPx: 390,
      primaryActionDock: 'bottom-dock',
      minTouchTargetPx: 36,
      readingMeasureCh: 50,
      isSingleColumnFlow: true,
    };
    const res = evaluateErgonomicPosture(smallTouch);
    expect(res.passes).toBe(false);
    expect(res.violations).toContain('Touch target size 36px fails Apple HIG / WCAG 2.2 AAA minimum envelope of 44px.');
  });

  it('enforces reading measure <= 65ch on desktop', () => {
    const wideDesktop: ErgonomicPostureConfig = {
      viewportWidthPx: 1280,
      primaryActionDock: 'inline',
      minTouchTargetPx: 44,
      readingMeasureCh: 95,
      isSingleColumnFlow: false,
    };
    const resWide = evaluateErgonomicPosture(wideDesktop);
    expect(resWide.passes).toBe(false);
    expect(resWide.violations.some(v => v.includes('Reading measure 95ch exceeds optimal'))).toBe(true);

    const optimalDesktop: ErgonomicPostureConfig = {
      viewportWidthPx: 1280,
      primaryActionDock: 'inline',
      minTouchTargetPx: 44,
      readingMeasureCh: 62,
      isSingleColumnFlow: false,
    };
    expect(evaluateErgonomicPosture(optimalDesktop).passes).toBe(true);
  });
});

describe('Swiss-Silk Doctrine: Unified Orchestrator (auditSwissSilkDoctrine)', () => {
  it('passes a fully compliant Swiss-Silk implementation', () => {
    const spec: SwissSilkAuditSpec = {
      name: 'Compliant Form Wizard',
      viewportWidthPx: 390,
      typography: {
        fontFamilies: ['Plus Jakarta Sans'],
        controlFontFamilies: { buttons: 'Plus Jakarta Sans', badges: 'Plus Jakarta Sans' },
        inputFontSizesPx: [16, 16],
        fontSizesPx: [13, 16, 20, 25, 31],
        viewportWidthPx: 390,
      },
      visualNoise: {
        backgroundStyles: ['#0C1017', 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)'],
        hasCrosshairs: false,
        stackedHeadersCount: 1,
        spacingsPx: [8, 16, 24, 32, 48],
      },
      surface: {
        containerBorderRadiusPx: 24,
        isElevatedSurface: true,
        borderAlpha: 0.08,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      ergonomics: {
        viewportWidthPx: 390,
        primaryActionDock: 'bottom-dock',
        minTouchTargetPx: 48,
        readingMeasureCh: 58,
        isSingleColumnFlow: true,
      },
      opticalLegibility: {
        elements: [
          { role: 'h1', fontSizePx: 28, fontWeight: 700, absLc: 95 },
          { role: 'body', fontSizePx: 16, fontWeight: 400, absLc: 85 },
          { role: 'button', fontSizePx: 16, fontWeight: 600, absLc: 75 },
        ],
      },
      containers: {
        containers: [
          {
            id: 'wizard-card',
            type: 'card',
            paddingPx: { top: 24, right: 24, bottom: 24, left: 24 },
            innerGapPx: 16,
            headingTopMarginPx: 24,
            headingBottomMarginPx: 8,
            titleOpticalMass: 35,
            bodyOpticalMass: 16,
          },
        ],
      },
    };

    const audit = auditSwissSilkDoctrine(spec);
    expect(audit.isCompliant).toBe(true);
    expect(audit.score).toBe(100);
    expect(audit.violations.length).toBe(0);
    expect(audit.grade).toBe('AAA');
  });
});
