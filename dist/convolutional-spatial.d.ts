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
export interface PageMacroGistConfig {
    viewportWidthPx: number;
    viewportHeightPx: number;
    contentContainerWidthPx: number;
    horizontalCanvasMarginPx: number;
    readingMeasureChars: number;
    estimatedWhitespaceRatio?: number;
}
export interface PageMacroGistResult {
    passes: boolean;
    whitespaceRatio: number;
    isMeasureOptimal: boolean;
    violations: string[];
}
export declare function auditGlobalPageGist(config: PageMacroGistConfig): PageMacroGistResult;
export interface InterContainerSpec {
    outerMarginPx: number;
    interContainerGutterPx: number;
    intraContainerPaddingPx: number;
    containerWidthPx?: number;
    childItems?: Array<{
        id: string;
        minWidthPx: number;
    }>;
    isScrollableOrWrap?: boolean;
}
export interface InterContainerResult {
    passes: boolean;
    satisfiesHierarchyInequality: boolean;
    violations: string[];
}
export declare function auditInterContainerRelations(spec: InterContainerSpec): InterContainerResult;
export interface FormGroupClusterSpec {
    id: string;
    labelToInputGapPx: number;
    inputToNextGroupGapPx: number;
    hasHelperText?: boolean;
    inputToHelperGapPx?: number;
}
export interface IntraContainerClusterConfig {
    containerId: string;
    paddingPx: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    childGapPx: number;
    formGroups?: FormGroupClusterSpec[];
    headingMarginTopPx?: number;
    headingMarginBottomPx?: number;
}
export interface IntraContainerClusterResult {
    passes: boolean;
    violations: string[];
}
export declare function auditIntraContainerClusters(config: IntraContainerClusterConfig): IntraContainerClusterResult;
export interface TypographicAttributeSpec {
    role: 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'button' | 'caption' | 'code';
    fontSizePx: number;
    fontWeight: number;
    lineHeightPx?: number;
    letterSpacingEm?: number;
    colorHex?: string;
    bgHex?: string;
    absLc?: number;
    textWrap?: string;
    textSnippet?: string;
}
export interface TypographicAttributeResult {
    passes: boolean;
    violations: string[];
}
export declare function auditTypographicMicroAttributes(elements: TypographicAttributeSpec[]): TypographicAttributeResult;
export interface VisualClutterSpec {
    titles: string[];
}
export interface VisualClutterResult {
    passes: boolean;
    violations: string[];
}
export declare function auditVisualNoiseClutter(spec: VisualClutterSpec): VisualClutterResult;
export interface ConvolutionalLayoutSpec {
    name: string;
    macro: PageMacroGistConfig;
    meso: InterContainerSpec;
    microContainers: IntraContainerClusterConfig[];
    typography: TypographicAttributeSpec[];
    adjacentTitles?: string[];
}
export interface ConvolutionalLayoutResult {
    name: string;
    isCompliant: boolean;
    score: number;
    grade: 'AAA' | 'AA' | 'A' | 'F';
    violations: string[];
    subsystemResults: {
        macro: PageMacroGistResult;
        meso: InterContainerResult;
        micro: IntraContainerClusterResult[];
        typography: TypographicAttributeResult;
        clutter?: VisualClutterResult;
    };
}
export declare function runConvolutionalLayoutAudit(spec: ConvolutionalLayoutSpec): ConvolutionalLayoutResult;
