# Regulatory Standards & WCAG 3 Matrix

> **Package:** `@intuitui-labs/a11y-gate`  
> **Module:** `@intuitui-labs/a11y-gate/standards-matrix`  
> **Standards Covered:** WCAG 2.1 AA/AAA, WCAG 2.2, W3C APCA 0.98G (WCAG 3 Candidate), Section 508, EN 301 549, Axe-Core Rule Baseline  

---

## 1. Multi-Standard Coverage Matrix

`@intuitui-labs/a11y-gate` enforces the **Dual-Standard Doctrine**:
- **Statutory Legal Compliance Baseline**: WCAG 2.2 AA (ADA Titles II/III, Section 508, EN 301 549). Violations represent hard legal defects.
- **Sovereign Adopted Standard**: WCAG 3.0 (W3C APCA 0.98G). The primary adopted standard across our architecture, enforcing continuous psychophysical curves and spatial-frequency modeling.

| Mandate / Standard | Role & Tier | Key Evaluated Criteria | `@intuitui-labs/a11y-gate` Module |
| :--- | :--- | :--- | :--- |
| **WCAG 2.1 AA / AAA** | Statutory Baseline Floor | 1.4.3 Contrast (Minimum 4.5:1), 1.4.6 Contrast (Enhanced 7:1) | `contrast-math.ts` |
| **WCAG 2.2** | Statutory Baseline Floor | 2.4.11 Focus Not Obscured, 2.4.12 Focus Not Obscured (Enhanced), 2.4.13 Focus Appearance, 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum 24x24) | `ratio-doctrine.ts`, `mobile-audit.ts` |
| **W3C APCA 0.98G** | Sovereign Adopted Standard (WCAG 3) | Spatial-frequency dependent lightness contrast ($L_c$), polarity (dark-on-light vs light-on-dark), dynamic weight-to-size lookup matrix | `wcag3.ts`, `contrast-math.ts` |
| **Section 508 (US Federal)** | Statutory Baseline Floor | Software user interfaces, keyboard navigation, contrast, color independence | `standards-matrix.ts` |
| **EN 301 549 (EU Mandate)** | Statutory Baseline Floor | Mobile accessibility, touch targets, closed systems, non-web ICT | `mobile-audit.ts`, `platform-audit.ts` |
| **Axe-Core Baseline** | Automated Tooling Gate | Color contrast, aria attributes, button labeling, role validity | `axe-baseline.ts` |

---

## 2. APCA 0.98G vs WCAG 2 Contrast Comparison

| Feature | WCAG 2.1 Relative Luminance | W3C APCA 0.98G |
| :--- | :--- | :--- |
| **Contrast Ratio Formula** | $(L_1 + 0.05) / (L_2 + 0.05)$ | Non-linear power functions modeling cone photoreceptors |
| **Polarity Sensitivity** | Symmetrical (White on Black = Black on White) | Asymmetrical (Light-on-dark is scored differently to reflect pupil dilation) |
| **Font-Weight Awareness** | Binary ($< 18\text{pt}$ vs $\ge 18\text{pt}$) | Continuous matrix from thin 100 to ultra-bold 900 |
| **Spatial Frequency** | Ignored | Incorporated (thin strokes require higher $L_c$) |

---

## 3. Automated Axe Baseline Parity

`@intuitui-labs/a11y-gate` provides zero-dependency automated verification of standard Axe rules:
- `color-contrast`: APCA and WCAG 2.2 relative luminance verification.
- `target-size`: Enforces 44pt / 48px touch bounding targets.
- `focus-order-semantics`: DAG-based sequential keyboard order audit.
- `aria-required-attr`: Ensures interactive nodes declare appropriate role descriptions.

---

## 4. API Reference & Code Examples

### 4.1 Cross-Standard Compliance Audit
```typescript
import { evaluateComplianceMatrix } from '@intuitui-labs/a11y-gate';

const report = evaluateComplianceMatrix({
  contrastRatio: 7.2,
  apcaLc: 92,
  touchDimensionPx: 48,
  focusStrokePx: 2.5,
  focusOffsetPx: 2.0,
});

console.log(report.wcag21AAA);  // true
console.log(report.wcag22Pass); // true
console.log(report.apcaBronze); // true
console.log(report.section508); // true
console.log(report.en301549);   // true
```

---

## 5. Spacing Baseline & Proportional Typographic Tiers

In addition to contrast and semantics, `@intuitui-labs/a11y-gate` enforces **WCAG 1.4.12 Text Spacing** and **Gestalt Spatial Enclosure** as a hard legal baseline in `auditMultiStandardBaseline` and `auditComprehensiveA11yGate`.

### 5.1 Hard Baseline Failure Rules
Any element violating these thresholds is classified as an immediate **Hard Baseline Error** that fails the build:
* **Font Size Floor (WCAG 1.4.4)**: $< 12\text{px}$ desktop or $< 14\text{px}$ mobile.
* **Mobile Input Floor**: $< 16\text{px}$ on mobile inputs (triggers destructive iOS viewport zoom).
* **Crushed Leading (WCAG 1.4.12)**: Line-height ratio $< 1.30\times$ on body text.
* **Negative Micro-Tracking (WCAG 1.4.12)**: Letter-spacing $< 0.0\text{em}$ on copy $\le 14\text{px}$.
* **Crushed Word Spacing (WCAG 1.4.12)**: Word spacing $< 0.16\times \text{fontSize}$.
* **Gestalt Container Enclosure Rupture**: Container $\text{Padding} < 0.85\times \text{Child Gap}$.

### 5.2 Conformance Tiers (Gold, Silver, Bronze, Fail)
Spacing compliance is classified alongside WCAG 3 / APCA levels:
* **Gold**: Optically pristine Swiss typography and spatial harmony (Score $\ge 90$).
* **Silver**: Balanced standard perceptual compliance (Score $75 - 89$).
* **Bronze**: Baseline legal compliance at the lower tolerance edge (Score $60 - 74$).
* **Fail**: Hard legal baseline failure or score $< 60$.

