# Accessibility Gate (`@intuitui-labs/a11y-gate`)

[![CI](https://github.com/Intuitui-Labs/a11y-gate/actions/workflows/ci.yml/badge.svg)](https://github.com/Intuitui-Labs/a11y-gate/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@intuitui-labs/a11y-gate?style=flat-square&color=2563EB)](https://www.npmjs.com/package/@intuitui-labs/a11y-gate)
[![Downloads](https://img.shields.io/npm/dm/@intuitui-labs/a11y-gate?style=flat-square&color=059669)](https://www.npmjs.com/package/@intuitui-labs/a11y-gate)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@intuitui-labs/a11y-gate?style=flat-square&color=7C3AED)](https://bundlephobia.com/package/@intuitui-labs/a11y-gate)
[![W3C APCA](https://img.shields.io/badge/W3C%20APCA-0.98G%20(WCAG%203)-6366F1?style=flat-square)](https://www.w3.org/WAI/GL/task-forces/silver/wiki/Visual_Contrast_of_Text_Subgroup)
[![Psychophysics Ratios](https://img.shields.io/badge/Psychophysics-Weber--Fechner%20Floors-EC4899?style=flat-square)](docs/psychophysical-ratio-doctrine.md)
[![Swiss SILK](https://img.shields.io/badge/Architecture-Swiss%20SILK%20Canon-0EA5E9?style=flat-square)](docs/swiss-silk-architecture.md)
[![Spatial Matrix](https://img.shields.io/badge/Spatial-2D%20Convolutional%20Matrix-F59E0B?style=flat-square)](docs/convolutional-spatial-matrix.md)
[![CVD Simulation](https://img.shields.io/badge/CVD-Brettel%20%7C%20Machado%20LMS-10B981?style=flat-square)](docs/standards-and-wcag3-matrix.md)
[![Cognitive Entropy](https://img.shields.io/badge/Cognition-Shannon%20Visual%20Entropy-8B5CF6?style=flat-square)](docs/cognitive-saliency-and-entropy.md)
[![Universal Runtime](https://img.shields.io/badge/Runtime-Node%2018%2B%20%7C%20Web%20%7C%20React%20Native-0284C7?style=flat-square)](https://github.com/Intuitui-Labs/a11y-gate)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Math)-16A34A?style=flat-square)](package.json)
[![Tree-Shaking](https://img.shields.io/badge/Tree--Shaking-Pure%20ESM-8B5CF6?style=flat-square)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest 5](https://img.shields.io/badge/tested%20with-Vitest%205%20(108%20passed)-729B1B?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-D97706?style=flat-square)](LICENSE)

> **Mathematical Accessibility, Pure-Ratio Psychophysics, 2D Convolutional Layout Spatial Matrix, W3C APCA 0.98G, Color Vision Deficiency (CVD) Simulation, Cognitive Clutter Metrics, and Swiss SILK Architecture CI Gate.**

Developed by **Intuitui Labs**.

---

## 1. Philosophical & Mathematical Foundation

Modern accessibility often obsesses over arbitrary static scalar thresholds ($16\text{px}$, $8\text{px}$, $4.5:1$). In contrast, **human visual perception and cognition operate exclusively on relative ratios ($I_1 / I_0$)**:

- **Weber-Fechner Law ($\Delta I / I = k$)**: Perceived sensory change is proportional to initial intensity.
- **Stevens' Power Law ($\psi = k \cdot I^\alpha$)**: Sensation scales non-linearly with physical stimulus magnitude.
- **Modulation Transfer Function (MTF)**: Foveal optical diffraction blurs stroke stems below $1.25\text{px}$.
- **Concentricity Canon**: Concentric rounded corners must satisfy $R_{\text{inner}} = \max(0, R_{\text{outer}} - \text{Padding})$.

`@intuitui-labs/a11y-gate` is built from the ground up to enforce these laws mathematically in automated CI/CD pipelines.

---

## 2. Installation

Install the canonical package:

```bash
# Using pnpm
pnpm add @intuitui-labs/a11y-gate

# Using npm
npm install @intuitui-labs/a11y-gate

# Using yarn
yarn add @intuitui-labs/a11y-gate
```

---

## 3. Core Modules & Capabilities

### 3.1 Pure-Ratio Psychophysical Doctrine
- **Non-Uniform Dynamic Type Power Law**: Headings scale sub-linearly ($\alpha = 0.65 - 0.78$) while body and captions scale super-linearly ($\alpha = 1.05 - 1.22$).
- **Optical Stem Thickness Floor**: Calculates physical stroke width $W_{\text{stem}}$ to prevent subpixel diffraction blur ($W_{\text{stem}} \ge 1.25\text{px}$).
- **Gestalt Proximity & Heading Clinging**: Margin-top must be $\ge 2.0\times$ margin-bottom so headings physically cling to their content sections.
- **Concentric Corner Radius**: Enforces $R_{\text{inner}} = \max(0, R_{\text{outer}} - \text{Padding})$.
- **Focus Ring Offset & Stroke**: Enforces $\ge 2\text{px}$ stroke and $\ge 2\text{px}$ offset to prevent control border occlusion.
- **Harmonic Aspect Ratio Canon**: Validates card and modal dimensions against 1:1, 4:3, $\sqrt{2}$, 3:2, $\phi$ (Golden Ratio), and 16:9.

### 3.2 2D Convolutional Spatial Matrix
- **Touch Overlap Kernels ($K_{\text{overlap}}$)**: 2D discrete convolution identifies overlapping hit target zones and accidental tap risks.
- **Visual Reading Flow DAG**: Topological sorting verifies intuitive, un-fragmented reading order.
- **Occlusion Detection**: Identifies floating sheets, toolbars, or headers that occlude active controls.

### 3.3 Cognitive Saliency & Visual Clutter
- **Cognitive Clutter Index ($CCI$)**: Quantifies layout density and bounding box noise.
- **Shannon Layout Entropy**: Measures chaotic spatial line fragments.
- **Dual-Encoding Audit**: Enforces multi-channel signaling (color + icon + text) per WCAG 2.2 SC 1.4.1.

### 3.4 Swiss Graphic Doctrine & SILK Architecture
- **Jan Tschichold Golden Canon**: Optical page margin balance ($2:3:4:6$).
- **Base-8 Quantum Grid**: Strict $8\text{px} / 4\text{px}$ modular spacing rhythm.
- **Harmonic Font Scales**: Golden, Silver, and Swiss geometric typography ladders.

### 3.5 Mathematical Contrast & Color Science
- **W3C APCA 0.98G (WCAG 3 Candidate)**: Lightness contrast ($L_c$) with continuous font-weight (100–900) lookup matrix.
- **WCAG 2.1 / 2.2 Relative Luminance**: Standard ISO 9241-306 contrast calculations.
- **Color Vision Deficiency (CVD) Simulation**: Full Brettel-Viénot / Machado LMS cone transformations (Deuteranopia, Protanopia, Tritanopia, Achromatopsia).
- **Chromostereopsis Hazard Detection**: Prevents saturated red/blue optical depth vibration.

---

## 4. Quickstart Examples

### 4.1 Running a Pure-Ratio Psychophysical Audit
```typescript
import { auditPsychophysicalRatios } from '@intuitui-labs/a11y-gate';

const result = auditPsychophysicalRatios({
  viewportWidthPx: 390,
  viewportHeightPx: 844,
  canvasMarginHorizontalPx: 20, // 5.1% (>= 4%)
  contentWidthPx: 350,

  interContainerGutterPx: 16,
  intraContainerPaddingPx: 16, // 1.0 (>= 0.75)

  labelToInputGapPx: 6,
  inputToNextGroupGapPx: 18, // 3.0 (>= 1.50)

  headingMarginTopPx: 24,
  headingMarginBottomPx: 8, // 3.0 (>= 2.00)

  fontSizePx: 15,
  fontWeight: 500,
  lineHeightPx: 24,
  colorHex: '#0F172A',
  bgHex: '#FFFFFF',
  role: 'body',

  touchHitDimensionPx: 48,
  visualGlyphDimensionPx: 20,
});

console.log(result.passes); // true
console.log(result.score);  // 100
```

### 4.2 Non-Uniform Dynamic Type Scaling
```typescript
import { computeNonUniformDynamicScale } from '@intuitui-labs/a11y-gate';

// User requests 1.6x accessibility text bump:
const display = computeNonUniformDynamicScale({
  baseFontSizePx: 34,
  scaleFactor: 1.6,
  role: 'display',
});
console.log(display.scaledFontSizePx); // 46.1px (sub-linear, prevents overflow)

const caption = computeNonUniformDynamicScale({
  baseFontSizePx: 12,
  scaleFactor: 1.6,
  role: 'caption',
});
console.log(caption.scaledFontSizePx); // 21.3px (super-linear, protects legibility)
```

### 4.3 Concentric Corner Radius Audit
```typescript
import { auditConcentricCornerRadius } from '@intuitui-labs/a11y-gate';

const card = auditConcentricCornerRadius({
  outerRadiusPx: 24,
  innerRadiusPx: 8,
  paddingPx: 16, // Ideal: 24 - 16 = 8px
});

console.log(card.passes); // true
```

---

## 5. Exhaustive Documentation Suite

- [Pure-Ratio Psychophysical Doctrine](docs/psychophysical-ratio-doctrine.md)
- [Hotspot Dynamics, Affordance Diversity & Adaptive Density](docs/hotspot-diversity-and-density.md)
- [Convolutional Spatial Affordance Matrix](docs/convolutional-spatial-matrix.md)
- [Cognitive Saliency & Visual Clutter Architecture](docs/cognitive-saliency-and-entropy.md)
- [Swiss Graphic Doctrine & SILK Architecture](docs/swiss-silk-architecture.md)
- [Regulatory Standards & WCAG 3 Matrix](docs/standards-and-wcag3-matrix.md)
- [Testing Specifications & Evidence Protocol](docs/testing.md)
- [Badges, Metrics & Quality Signals Landscape](docs/badges-and-metrics.md)
- [NPM Publishing Guide](docs/publishing.md)

---

## License

MIT © Intuitui Labs & Neev Foundation
