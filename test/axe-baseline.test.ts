import { describe, it, expect } from 'vitest';
import {
  evaluateAxeBaseline,
  auditUnifiedPlatform,
  type AxeResultsLike,
  type UnifiedAuditSpec,
} from '../src/axe-baseline';

describe('Axe-Core Baseline & Unified Platform Audit', () => {
  it('correctly processes and formats axe-core violations', () => {
    const mockAxe: AxeResultsLike = {
      violations: [
        {
          id: 'color-contrast',
          impact: 'serious',
          description: 'Contrast ratio does not meet minimum threshold',
          help: 'Elements must have sufficient color contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.13/color-contrast',
          nodes: [{ html: '<button>Click</button>', target: ['button'] }],
        },
        {
          id: 'heading-order',
          impact: 'moderate',
          description: 'Heading levels should only increase by one',
          help: 'Heading order must be semantic',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.13/heading-order',
          nodes: [{ html: '<h3>Title</h3>', target: ['h3'] }],
        },
      ],
    };

    const result = evaluateAxeBaseline(mockAxe);
    expect(result.passesBaseline).toBe(false);
    expect(result.violationCount).toBe(2);
    expect(result.seriousCount).toBe(1);
    expect(result.moderateCount).toBe(1);
    expect(result.formattedViolations[0]).toContain('[SERIOUS] color-contrast');
  });

  it('passes baseline when axe-core reports zero violations', () => {
    const cleanAxe: AxeResultsLike = { violations: [] };
    const result = evaluateAxeBaseline(cleanAxe);
    expect(result.passesBaseline).toBe(true);
    expect(result.violationCount).toBe(0);
    expect(result.formattedViolations.length).toBe(0);
  });

  it('certifies as Certified-AAA when both Axe baseline and Swiss-Silk pass perfectly', () => {
    const cleanAxe: AxeResultsLike = { violations: [] };
    const spec: UnifiedAuditSpec = {
      name: 'Perfect Page',
      axeResults: cleanAxe,
      swissSilkSpec: {
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
          backgroundStyles: ['#0C1017'],
          hasCrosshairs: false,
          stackedHeadersCount: 1,
          spacingsPx: [8, 16, 24, 32],
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
          readingMeasureCh: 50,
          isSingleColumnFlow: true,
        },
      },
    };

    const unified = auditUnifiedPlatform(spec);
    expect(unified.isFullyCertified).toBe(true);
    expect(unified.compositeGrade).toBe('Certified-AAA');
    expect(unified.baseline.passed).toBe(true);
    expect(unified.perceptual.isCompliant).toBe(true);
  });

  it('grades as Compliant-Baseline-Only when Axe passes but Swiss-Silk fails on aesthetic clutter', () => {
    const cleanAxe: AxeResultsLike = { violations: [] };
    const spec: UnifiedAuditSpec = {
      name: 'Cluttered UI',
      axeResults: cleanAxe,
      swissSilkSpec: {
        name: 'Cluttered UI',
        viewportWidthPx: 390,
        typography: {
          fontFamilies: ['Plus Jakarta Sans', 'Space Mono', 'Fraunces'], // AI font soup
          viewportWidthPx: 390,
        },
        visualNoise: {
          backgroundStyles: ['#0C1017'],
          hasCrosshairs: false,
        },
        surface: {
          containerBorderRadiusPx: 0,
          isElevatedSurface: true,
          borderAlpha: 1.0,
          transitionTimingFunction: 'linear',
        },
        ergonomics: {
          viewportWidthPx: 390,
          primaryActionDock: 'top-nav',
          minTouchTargetPx: 30,
          readingMeasureCh: 50,
          isSingleColumnFlow: true,
        },
      },
    };

    const unified = auditUnifiedPlatform(spec);
    expect(unified.isFullyCertified).toBe(false);
    expect(unified.compositeGrade).toBe('Compliant-Baseline-Only');
    expect(unified.baseline.passed).toBe(true);
    expect(unified.perceptual.isCompliant).toBe(false);
  });
});
