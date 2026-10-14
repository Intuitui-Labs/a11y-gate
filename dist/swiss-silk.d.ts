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
export interface TypographicPurityConfig {
    fontFamilies: string[];
    monoUsage?: 'code-only' | 'unrestricted';
    controlFontFamilies?: Record<string, string>;
    inputFontSizesPx?: number[];
    fontSizesPx?: number[];
    viewportWidthPx?: number;
}
export interface TypographicPurityResult {
    passes: boolean;
    passesFloor: boolean;
    scaleConformant: boolean;
    violations: string[];
}
export declare function evaluateTypographicPurity(config: TypographicPurityConfig): TypographicPurityResult;
export interface TextElementSpec {
    role: 'h1' | 'h2' | 'h3' | 'label' | 'body' | 'caption' | 'button' | 'badge';
    fontSizePx: number;
    fontWeight: number;
    colorHex?: string;
    bgHex?: string;
    absLc?: number;
    textSnippet?: string;
}
export interface OpticalLegibilityConfig {
    elements: TextElementSpec[];
    defaultBgHex?: string;
}
export interface OpticalLegibilityResult {
    passes: boolean;
    violations: string[];
}
export declare function evaluateOpticalLegibility(config: OpticalLegibilityConfig): OpticalLegibilityResult;
export interface ContainerSpec {
    id: string;
    type: 'card' | 'form-group' | 'modal' | 'section' | 'pill-badge';
    paddingPx: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    innerGapPx: number;
    headingTopMarginPx?: number;
    headingBottomMarginPx?: number;
    titleOpticalMass?: number;
    bodyOpticalMass?: number;
}
export interface ContainerHierarchyConfig {
    containers: ContainerSpec[];
}
export interface ContainerHierarchyResult {
    passes: boolean;
    violations: string[];
}
export declare function evaluateContainerHierarchy(config: ContainerHierarchyConfig): ContainerHierarchyResult;
export interface VisualNoiseConfig {
    backgroundStyles: string[];
    hasCrosshairs?: boolean;
    stackedHeadersCount?: number;
    spacingsPx?: number[];
}
export interface VisualNoiseResult {
    passes: boolean;
    hasLiteralGridWallpaper: boolean;
    passesSpatialQuantum: boolean;
    violations: string[];
}
export declare function evaluateVisualNoise(config: VisualNoiseConfig): VisualNoiseResult;
export interface SurfaceCurvatureConfig {
    containerBorderRadiusPx: number;
    isElevatedSurface: boolean;
    borderAlpha: number;
    transitionTimingFunction: string;
}
export interface SurfaceCurvatureResult {
    passes: boolean;
    isSquircleConformant: boolean;
    isSpringConformant: boolean;
    violations: string[];
}
export declare function evaluateSurfaceCurvature(config: SurfaceCurvatureConfig): SurfaceCurvatureResult;
export interface ErgonomicPostureConfig {
    viewportWidthPx: number;
    primaryActionDock: 'bottom-dock' | 'top-nav' | 'inline' | 'floating';
    minTouchTargetPx: number;
    readingMeasureCh: number;
    isSingleColumnFlow: boolean;
}
export interface ErgonomicPostureResult {
    passes: boolean;
    violations: string[];
}
export declare function evaluateErgonomicPosture(config: ErgonomicPostureConfig): ErgonomicPostureResult;
export interface SwissSilkAuditSpec {
    name: string;
    viewportWidthPx: number;
    typography: TypographicPurityConfig;
    visualNoise: VisualNoiseConfig;
    surface: SurfaceCurvatureConfig;
    ergonomics: ErgonomicPostureConfig;
    opticalLegibility?: OpticalLegibilityConfig;
    containers?: ContainerHierarchyConfig;
}
export interface SwissSilkAuditResult {
    name: string;
    isCompliant: boolean;
    score: number;
    grade: 'AAA' | 'AA' | 'A' | 'F';
    violations: string[];
    subsystemResults: {
        typography: TypographicPurityResult;
        visualNoise: VisualNoiseResult;
        surface: SurfaceCurvatureResult;
        ergonomics: ErgonomicPostureResult;
        opticalLegibility?: OpticalLegibilityResult;
        containers?: ContainerHierarchyResult;
    };
}
export declare function auditSwissSilkDoctrine(spec: SwissSilkAuditSpec): SwissSilkAuditResult;
