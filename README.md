<p align="center">
  <a href="https://www.npmjs.com/package/@intuitui-labs/a11y-gate">
    <img src="https://img.shields.io/npm/v/@intuitui-labs/a11y-gate.svg?style=flat-square&color=black" alt="npm version" />
  </a>
  <a href="https://github.com/NeevSK/a11y-gate/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/NeevSK/a11y-gate/ci.yml?branch=main&style=flat-square" alt="build status" />
  </a>
  <a href="https://bundlephobia.com/package/@intuitui-labs/a11y-gate">
    <img src="https://img.shields.io/bundlephobia/minzip/@intuitui-labs/a11y-gate?style=flat-square&color=blue" alt="bundle size" />
  </a>
  <a href="https://github.com/NeevSK/a11y-gate/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="license" />
  </a>
  <a href="https://www.w3.org/WAI/GL/task-forces/silver/wiki/Visual_Contrast_of_Text_Subgroup">
    <img src="https://img.shields.io/badge/W3C%20APCA-0.98G-6366f1?style=flat-square" alt="APCA contrast" />
  </a>
  <a href="https://vitest.dev/">
    <img src="https://img.shields.io/badge/tested%20with-vitest%20v5-729B1B?style=flat-square" alt="vitest 5" />
  </a>
  <a href="https://www.npmjs.com/package/@intuitui-labs/a11y-gate">
    <img src="https://img.shields.io/badge/types-TypeScript-blue?style=flat-square" alt="types" />
  </a>
</p>

# @intuitui-labs/a11y-gate

> **Mathematical accessibility, W3C APCA 0.98G contrast, Color Vision Deficiency (CVD) simulation, spatial harmony, tactile motion architecture, and mobile ergonomics CI gate for design systems.**

Developed by **Intuitui Labs**.

---

## 1. Installation

Install the canonical package from npm:

```bash
# Using pnpm
pnpm add @intuitui-labs/a11y-gate

# Using npm
npm install @intuitui-labs/a11y-gate

# Using yarn
yarn add @intuitui-labs/a11y-gate
```

---

## 2. Features & Capabilities

### Mathematical Contrast & Perceptual Color Optics
- **WCAG 2.1 / 2.2 Relative Luminance & Contrast Ratio**: Standard ISO 9241-306 contrast calculations.
- **W3C APCA 0.98G (WCAG 3 Candidate)**: Perceptually uniform lightness contrast ($L_c$) with dynamic font-weight/font-size lookup matrix.
- **Color Vision Deficiency (CVD) Simulation**: Full Brettel-Viénot / Machado LMS cone transformation for Deuteranopia, Protanopia, Tritanopia, and Achromatopsia.

### Spatial Rhythm & Typographic Geometry
- **Utopia Fluid Clamp Formulas**: Generates exact CSS `clamp(min, preferred, max)` interpolation strings.
- **Base-8 Quantum Grid Multiples**: Validates padding, margin, and layout intervals against 4px / 8px baselines.
- **Touch Target Geometry**: Validates minimum interactive dimensions ($\ge 44\text{px}$ / $48\text{px}$).

### Motion & Tactile Spring Physics
- **Tiered Spring Presets**: `subtle` (150ms), `tactile` (220ms), `expressive` (320ms).
- **Continuous Gradient Interpolation**: `getInterpolatedMotion(0.0 to 1.0)`.
- **Ambient Surface Illumination**: `generateAmbientGlowCss(...)`.
- **WCAG 2.2 SC 2.3.3 Reduced Motion Safety**: Universal `@media (prefers-reduced-motion: reduce)` harness.

### Automated CI Gate Runner
- **One-Line Vitest/Jest Integration**:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { runA11ySuite } from '@intuitui-labs/a11y-gate';
  import { MY_TOKENS, MY_TYPE_SCALE } from './tokens';

  runA11ySuite(
    {
      name: 'Design System Audit',
      tokens: MY_TOKENS,
      typeScale: MY_TYPE_SCALE,
      minimumMicroPx: 14,
      testCvd: true,
    },
    { describe, it, expect }
  );
  ```

---


---

## 3. Tree-Shakable Subpath Exports

The package is partitioned into tree-shakable subpaths to keep web and mobile runtime footprints minimal:

| Subpath | Target Environment | Core Exports |
| :--- | :--- | :--- |
| **`@intuitui-labs/a11y-gate`** | Universal / Node / Edge | Core APCA contrast math, WCAG 2.2, CVD cone matrices, Delta E, token types |
| **`@intuitui-labs/a11y-gate/wcag3`** | Universal / Design Systems | Exhaustive WCAG 3 / APCA model: Gold/Silver/Bronze/Component scoring, polarity (BoW/WoB), w100–w900 font weight matrix |
| **`@intuitui-labs/a11y-gate/mobile`** | React Native / iOS / Android | Headless touch target standards (48dp/44pt), defensive `getTouchHitSlop`, dynamic typography validation, `getBestText` candidate picker |
| **`@intuitui-labs/a11y-gate/web`** | Browsers / Modern Web | Utopia fluid clamp token CSS generation, web safe-area CSS rules, CSS capabilities audits |
| **`@intuitui-labs/a11y-gate/contrast`**| Universal Math | Standalone APCA 0.98G and WCAG 2.2 contrast calculation functions |
| **`@intuitui-labs/a11y-gate/cvd`**     | Color Science | Brettel-Viénot LMS cone response simulations |

```typescript
// In React Native:
import { checkMobileTouchTarget, getTouchHitSlop, getBestText } from '@intuitui-labs/a11y-gate/mobile';

// In Design System or Tokens engine:
import { evaluateWcag3 } from '@intuitui-labs/a11y-gate/wcag3';

// In Web / CSS systems:
import { generateFluidTokenVars, generateSafeAreaCssRules } from '@intuitui-labs/a11y-gate/web';
```

## 4. Quick Usage Example

```typescript
import {
  getWcagContrastRatio,
  calculateApca,
  getApcaFontMatrix,
  simulateCvdHex,
  generateFluidClamp,
  SPRING_PRESETS,
  getInterpolatedMotion,
} from '@intuitui-labs/a11y-gate';

// 1. WCAG 2.2 AAA Check
const ratio = getWcagContrastRatio('#090d16', '#ffffff'); // 19.8:1

// 2. APCA Lightness Contrast Score
const lc = calculateApca('#090d16', '#ffffff'); // Lc 106.2

// 3. Official W3C APCA Minimum Font Size Recommendation
const fontMatrix = getApcaFontMatrix(Math.abs(lc));
console.log(fontMatrix.w400); // 14px (Regular)
console.log(fontMatrix.w700); // 11px (Bold)

// 4. Color-Blindness Simulation (Brettel LMS Cone Response)
const deuteranopiaHex = simulateCvdHex('#2563eb', 'deuteranopia');

// 5. Utopia Fluid Clamp CSS String
const clamp = generateFluidClamp({ minSizePx: 16, maxSizePx: 24 });
// -> clamp(1.0000rem, 0.8182rem + 0.9091vi, 1.5000rem)

// 6. Spring Physics Token
const tactileSpring = SPRING_PRESETS.tactile;
console.log(tactileSpring.bezier); // 'cubic-bezier(0.34, 1.56, 0.64, 1)'
```

---

## 5. Documentation
- [Testing Specifications & Evidence Protocol](docs/testing.md)
- [NPM Publishing Guide](docs/publishing.md)
- [Badges, Metrics & Quality Signals Landscape](docs/badges-and-metrics.md)

---

## License
MIT © Intuitui Labs & Neev Foundation
