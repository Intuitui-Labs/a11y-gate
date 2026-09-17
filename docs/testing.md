# Testing Architecture & Evidence Specification

> **Package:** `@intuitui-labs/a11y-gate`  
> **Test Engine:** Vitest 5.0+  
> **Coverage Provider:** @vitest/coverage-v8  
> **Evidence Levels:** G0 Contract/Unit & G1 Boundary/Simulation  

---

## 1. Evidence Level Classification

Per the platform's **Test-Claim Protocol**, tests in this package are classified across mathematical and qualitative audit tiers:

### Level G0: Pure Mathematical Contracts
- **Engine**: Vitest 5.0+ running on Node.js 22/24+
- **Scope**: Deterministic color science, optical contrast, and spatial formulas.
- **Suite**: `test/a11y-gate.test.ts`
- **Assertions prove**:
  - **WCAG 2.2 Relative Luminance**: Exact 21:1 black-on-white ratio and 1:1 identical color ratio.
  - **W3C APCA 0.98G**: Perceptual lightness contrast score ($L_c$) and font-size / font-weight matrix recommendations.
  - **Color Vision Deficiency (CVD)**: Accurate LMS cone matrix transforms for Deuteranopia, Protanopia, Tritanopia, and Achromatopsia.
  - **Spatial Fluid Clamp (Utopia)**: Mathematical `clamp()` interpolation between viewport extrema.
  - **Motion Springs**: Calibration of `subtle`, `tactile`, and `expressive` physics curves and reduced motion guardrails.

### Level G1: Qualitative UI / Screen Audits
- **Engine**: Vitest 5.0+ running on Node.js 22/24+
- **Scope**: React Native screen structure audits, ergonomics, and touch target validation.
- **Assertions prove**:
  - Minimum touch target dimensions ($ge 44\text{px}$ / $48\text{px}$).
  - Form field labeling and accessibility roles.
  - Reduced motion override correctness.
- **What is not proven**:
  - Physical hardware GPU rasterization or screen brightness curves.
  - Native iOS VoiceOver or Android TalkBack audio output timing.

---

## 2. Advanced Vitest 5 Capabilities Employed

| Capability | Implementation | Benefit |
| :--- | :--- | :--- |
| **T2 `fsModuleCache`** | `test.fsModuleCache: true` in `vitest.config.ts` | Transformed ASTs cached on disk; lightning warm runs. |
| **V11 `sharedViteServer`** | `test.sharedViteServer: true` in `vitest.config.ts` | Shared server daemon reducing RAM footprint. |
| **V8 Coverage Engine** | `@vitest/coverage-v8` | Fast native V8 branch, statement, and line test coverage. |

---

## 3. Running Test Suites

```bash
# Standard test run
pnpm test

# Test run with coverage analysis (text + lcov)
pnpm run test:coverage

# Interactive watch mode
pnpm run test:watch
```
