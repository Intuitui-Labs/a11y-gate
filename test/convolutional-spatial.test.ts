import { describe, it, expect } from 'vitest';
import {
  auditGlobalPageGist,
  auditInterContainerRelations,
  auditIntraContainerClusters,
  auditTypographicMicroAttributes,
  auditVisualNoiseClutter,
  runConvolutionalLayoutAudit,
  type PageMacroGistConfig,
  type InterContainerSpec,
  type IntraContainerClusterConfig,
  type TypographicAttributeSpec,
  type ConvolutionalLayoutSpec,
} from '../src/convolutional-spatial';

describe('Multi-Scale Convolutional Architecture: Macro Page Gist', () => {
  it('rejects cramped canvas horizontal margins (< 24px desktop)', () => {
    const config: PageMacroGistConfig = {
      viewportWidthPx: 1280,
      viewportHeightPx: 900,
      contentContainerWidthPx: 1260,
      horizontalCanvasMarginPx: 10, // cramped
      readingMeasureChars: 60,
      estimatedWhitespaceRatio: 0.10,
    };
    const result = auditGlobalPageGist(config);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('horizontal margin (10px) is cramped'))).toBe(true);
  });

  it('rejects blown-out reading measures (> 70ch desktop)', () => {
    const config: PageMacroGistConfig = {
      viewportWidthPx: 1280,
      viewportHeightPx: 900,
      contentContainerWidthPx: 900,
      horizontalCanvasMarginPx: 48,
      readingMeasureChars: 95, // too wide
      estimatedWhitespaceRatio: 0.35,
    };
    const result = auditGlobalPageGist(config);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('Desktop reading channel measure (95ch) exceeds'))).toBe(true);
  });

  it('passes balanced desktop page gist', () => {
    const config: PageMacroGistConfig = {
      viewportWidthPx: 1280,
      viewportHeightPx: 900,
      contentContainerWidthPx: 720,
      horizontalCanvasMarginPx: 48,
      readingMeasureChars: 62,
      estimatedWhitespaceRatio: 0.40,
    };
    const result = auditGlobalPageGist(config);
    expect(result.passes).toBe(true);
    expect(result.violations.length).toBe(0);
  });
});

describe('Multi-Scale Convolutional Architecture: Meso Inter-Container Relations', () => {
  it('enforces spatial hierarchy inequality: Gutter_inter >= Padding_intra * 0.75', () => {
    const crampedMeso: InterContainerSpec = {
      outerMarginPx: 48,
      interContainerGutterPx: 8, // 8px gutter between cards with 32px padding
      intraContainerPaddingPx: 32,
    };
    const result = auditInterContainerRelations(crampedMeso);
    expect(result.passes).toBe(false);
    expect(result.satisfiesHierarchyInequality).toBe(false);
    expect(result.violations.some(v => v.includes('Inter-container gutter (8px) is too tight'))).toBe(true);
  });

  it('enforces outer canvas margin >= inter-container gutter', () => {
    const invertedMeso: InterContainerSpec = {
      outerMarginPx: 12,
      interContainerGutterPx: 32,
      intraContainerPaddingPx: 24,
    };
    const result = auditInterContainerRelations(invertedMeso);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('Outer canvas margin (12px) is smaller'))).toBe(true);
  });
});

describe('Multi-Scale Convolutional Architecture: Micro Form-Group Proximity', () => {
  it('enforces label-to-input proximity over next-group gap', () => {
    const detachedFormGroup: IntraContainerClusterConfig = {
      containerId: 'wizard-card',
      paddingPx: { top: 24, right: 24, bottom: 24, left: 24 },
      childGapPx: 16,
      formGroups: [
        {
          id: 'email-field',
          labelToInputGapPx: 20, // label is 20px away from its input!
          inputToNextGroupGapPx: 12, // but input is only 12px away from next field!
        },
      ],
    };
    const result = auditIntraContainerClusters(detachedFormGroup);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('label-to-input gap (20px) must be strictly smaller'))).toBe(true);
  });
});

describe('Multi-Scale Convolutional Architecture: Typographic Micro-Attributes', () => {
  it('rejects crushed leading on body copy (< 1.40)', () => {
    const crushedBody: TypographicAttributeSpec[] = [
      { role: 'body', fontSizePx: 16, fontWeight: 400, lineHeightPx: 18, textSnippet: 'Crushed body lines' }, // 18/16 = 1.125
    ];
    const result = auditTypographicMicroAttributes(crushedBody);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('line-height ratio (1.13) is crushed'))).toBe(true);
  });

  it('rejects over-loose leading on headings (> 1.35)', () => {
    const looseHeading: TypographicAttributeSpec[] = [
      { role: 'h1', fontSizePx: 36, fontWeight: 700, lineHeightPx: 64, textSnippet: 'Floating Heading' }, // 64/36 = 1.77
    ];
    const result = auditTypographicMicroAttributes(looseHeading);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('line-height ratio (1.78) is too loose'))).toBe(true);
  });

  it('rejects wide letter-spacing on display headings', () => {
    const spacedHeading: TypographicAttributeSpec[] = [
      { role: 'h1', fontSizePx: 32, fontWeight: 700, lineHeightPx: 40, letterSpacingEm: 0.10, textSnippet: 'Spaced Out' },
    ];
    const result = auditTypographicMicroAttributes(spacedHeading);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('display heading "Spaced Out" letter-spacing'))).toBe(true);
  });

  it('strictly bans sub-12px micro-fonts (e.g. 8px, 9px, 10px badges/labels)', () => {
    const microText: TypographicAttributeSpec[] = [
      { role: 'caption', fontSizePx: 8, fontWeight: 600, textSnippet: 'REQUIRED MARK' },
      { role: 'caption', fontSizePx: 10, fontWeight: 700, textSnippet: 'LIVE PILL' },
    ];
    const result = auditTypographicMicroAttributes(microText);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('font size (8px) violates the 12px absolute legibility floor'))).toBe(true);
    expect(result.violations.some(v => v.includes('font size (10px) violates the 12px absolute legibility floor'))).toBe(true);
  });

  it('strictly bans anemic thin strokes (< 400) and sub-14px text with regular weight (< 500)', () => {
    const thinCopy: TypographicAttributeSpec[] = [
      { role: 'body', fontSizePx: 15, fontWeight: 300, textSnippet: 'Thin body' },
      { role: 'caption', fontSizePx: 12, fontWeight: 400, textSnippet: 'Sub-14px regular caption' },
    ];
    const result = auditTypographicMicroAttributes(thinCopy);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('uses anemic thin strokes (< 400)'))).toBe(true);
    expect(result.violations.some(v => v.includes('requires at least Medium weight (>= 500)'))).toBe(true);
  });

  it('bans washed-out greyish text on micro-copy (APCA Lc < 70)', () => {
    // #9BA7B8 on #FFFFFF has Lc ~ 38 (catastrophically low)
    const washedGreyText: TypographicAttributeSpec[] = [
      {
        role: 'caption',
        fontSizePx: 12,
        fontWeight: 600,
        colorHex: '#9BA7B8',
        bgHex: '#FFFFFF',
        textSnippet: 'Faint Grey Label',
      },
    ];
    const result = auditTypographicMicroAttributes(washedGreyText);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('fails micro-copy legibility threshold (Lc >= 70 required)'))).toBe(true);
  });

  it('enforces positive letter-spacing (>= +0.02em) on micro-copy to prevent glyph collision', () => {
    const squeezedMicroText: TypographicAttributeSpec[] = [
      { role: 'caption', fontSizePx: 12, fontWeight: 600, letterSpacingEm: -0.01, textSnippet: 'Squeezed Badge' },
    ];
    const result = auditTypographicMicroAttributes(squeezedMicroText);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('tracking (-0.01em) is squeezed: minimum +0.02em required'))).toBe(true);
  });
});

describe('Multi-Scale Convolutional Architecture: Horizontal Overflow & Visual Clutter', () => {
  it('detects horizontal row overflow and clipping when items exceed container width', () => {
    const overflowRow: InterContainerSpec = {
      outerMarginPx: 20,
      interContainerGutterPx: 16,
      intraContainerPaddingPx: 16,
      containerWidthPx: 600,
      childItems: [
        { id: 'card-1', minWidthPx: 240 },
        { id: 'card-2', minWidthPx: 240 },
        { id: 'card-3', minWidthPx: 240 }, // 240 * 3 + 32 = 752px > 600px!
      ],
      isScrollableOrWrap: false,
    };
    const result = auditInterContainerRelations(overflowRow);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('overflows with 3 items totaling 752px'))).toBe(true);
  });

  it('detects visual redundancy between duplicate adjacent header titles', () => {
    const spec = {
      titles: [
        'Real-Time Search-Grounded AI Compiler',
        'Real-Time Grounded Prompt Compiler',
      ],
    };
    const result = auditVisualNoiseClutter(spec);
    expect(result.passes).toBe(false);
    expect(result.violations.some(v => v.includes('Visual redundancy detected between adjacent titles'))).toBe(true);
  });
});

describe('Multi-Scale Convolutional Architecture: Full Composite Audit', () => {
  it('certifies a harmonious multi-scale layout with AAA grade', () => {
    const spec: ConvolutionalLayoutSpec = {
      name: 'Harmonious Form Screen',
      macro: {
        viewportWidthPx: 1280,
        viewportHeightPx: 900,
        contentContainerWidthPx: 720,
        horizontalCanvasMarginPx: 48,
        readingMeasureChars: 60,
        estimatedWhitespaceRatio: 0.38,
      },
      meso: {
        outerMarginPx: 48,
        interContainerGutterPx: 32,
        intraContainerPaddingPx: 24,
      },
      microContainers: [
        {
          containerId: 'main-card',
          paddingPx: { top: 32, right: 32, bottom: 32, left: 32 },
          childGapPx: 20,
          headingMarginTopPx: 24,
          headingMarginBottomPx: 8,
          formGroups: [
            {
              id: 'calling-name',
              labelToInputGapPx: 8,
              inputToNextGroupGapPx: 24,
              hasHelperText: true,
              inputToHelperGapPx: 6,
            },
          ],
        },
      ],
      typography: [
        {
          role: 'h1',
          fontSizePx: 32,
          fontWeight: 700,
          lineHeightPx: 38, // 38/32 = 1.18 (compact)
          letterSpacingEm: -0.01,
          absLc: 95,
          textSnippet: 'Alumni Registration',
        },
        {
          role: 'body',
          fontSizePx: 16,
          fontWeight: 400,
          lineHeightPx: 25, // 25/16 = 1.56 (comfortable)
          letterSpacingEm: 0.00,
          absLc: 85,
          textSnippet: 'Please enter your academic degree',
        },
        {
          role: 'button',
          fontSizePx: 16,
          fontWeight: 600,
          absLc: 75,
          textSnippet: 'Continue',
        },
      ],
    };

    const audit = runConvolutionalLayoutAudit(spec);
    expect(audit.isCompliant).toBe(true);
    expect(audit.score).toBe(100);
    expect(audit.grade).toBe('AAA');
    expect(audit.violations.length).toBe(0);
  });
});
