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

Mathematical accessibility, W3C APCA 0.98G contrast, Color Vision Deficiency (CVD) simulation, spatial harmony, and tactile motion architecture for modern design systems.

Developed by **Intuitui Labs & Neev Foundation**.

---

## Package Location
* **Local Disk Path**: `c:\projects\packages\a11y-gate`

---

## How to Import & Reuse in Other Personal Repositories

You can use this package across any of your other personal or work repositories using any of the following standard methods:

### Method 1: Local File Dependency (Recommended for Local Dev)
In any external project, install directly from the local folder path without publishing to npm:
```bash
# Using pnpm
pnpm add c:/projects/packages/a11y-gate

# Using npm
npm install c:/projects/packages/a11y-gate

# Using yarn
yarn add file:c:/projects/packages/a11y-gate
```
Or add directly to `package.json` of your other repository:
```json
{
  "dependencies": {
    "@intuitui-labs/a11y-gate": "file:c:/projects/packages/a11y-gate"
  }
}
```

### Method 2: Global Package Symlink (`pnpm link`)
To keep changes continuously synchronized across multiple independent repos on your machine:
1. In `c:\projects\packages\a11y-gate`:
   ```bash
   pnpm link --global
   ```
2. In your other personal project repo:
   ```bash
   pnpm link --global @intuitui-labs/a11y-gate
   ```

### Method 3: TypeScript Paths Mapping
In your project's `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@intuitui-labs/a11y-gate": ["c:/projects/packages/a11y-gate/dist/index.js"],
      "@intuitui-labs/a11y-gate/*": ["c:/projects/packages/a11y-gate/dist/*"]
    }
  }
}
```

### Method 4: Publish to NPM or GitHub Packages (Public or Private)
If you want to share it across multiple machines or in CI pipelines (GitHub Actions):
```bash
cd c:\projects\packages\a11y-gate
npm login
npm publish --access public
```
Then anywhere in the world:
```bash
pnpm add @intuitui-labs/a11y-gate
```

---

## Features & Exports

### 1. Mathematical Contrast & Color Optics
- **WCAG 2.1 / 2.2 Relative Luminance & Contrast Ratio**: Standard ISO 9241-306 contrast calculations.
- **W3C APCA 0.98G (WCAG 3 Candidate)**: Perceptually uniform lightness contrast ($L_c$) with font-weight/font-size lookup matrix.
- **Color Vision Deficiency (CVD) Simulation**: Full Brettel-Viénot / Machado LMS cone transformation for Deuteranopia, Protanopia, Tritanopia, and Achromatopsia.

### 2. Spatial Rhythm & Typographic Geometry
- **Utopia Fluid Clamp Formulas**: Generates exact CSS `clamp(min, preferred, max)` strings.
- **Base-8 Quantum Grid Multiples**: Validates padding, margin, and layout intervals against 4px / 8px baseline.
- **Touch Target Geometry**: Validates minimum interactive dimensions ($\ge 44\text{px}$ / $48\text{px}$).

### 3. Motion & Tactile Spring Physics
- **Tiered Spring Presets**: `subtle` (150ms), `tactile` (220ms), `expressive` (320ms).
- **Continuous Gradient Interpolation**: `getInterpolatedMotion(0.0 to 1.0)`.
- **Ambient Surface Illumination**: `generateAmbientGlowCss(...)`.
- **WCAG 2.2 SC 2.3.3 Reduced Motion Safety**: Universal `@media (prefers-reduced-motion: reduce)` harness.

### 4. Automated CI Gate Runner
- **One-Line Vitest/Jest Integration**:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { runA11ySuite } from '@intuitui-labs/a11y-gate';
  import { MY_TOKENS, MY_TYPE_SCALE } from './tokens';

  runA11ySuite(
    {
      name: 'My Personal Project',
      tokens: MY_TOKENS,
      typeScale: MY_TYPE_SCALE,
      minimumMicroPx: 14,
      testCvd: true,
    },
    { describe, it, expect }
  );
  ```

---

## Quick Usage Example

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

## License
MIT © Intuitui Labs & Neev Foundation

## Documentation
- [Testing Specifications & Evidence Protocol](docs/testing.md)
- [NPM Publishing Guide](docs/publishing.md)
- [Badges, Metrics & Quality Signals Landscape](docs/badges-and-metrics.md)
