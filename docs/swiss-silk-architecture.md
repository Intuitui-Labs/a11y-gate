# Swiss Graphic Doctrine & SILK Architecture

> **Package:** `@intuitui-labs/a11y-gate`  
> **Module:** `@intuitui-labs/a11y-gate/swiss-silk`  
> **Historical Lineage:** Josef Müller-Brockmann (*Grid Systems in Graphic Design*), Jan Tschichold (*Die neue Typographie*), Bauhaus Dessau  

---

## 1. Overview & Lineage

The Swiss Graphic Doctrine (International Typographic Style) and the **SILK Architecture** form the aesthetic and geometric discipline of `@intuitui-labs/a11y-gate`.

### The SILK Principles
- **S**calable: Pure relative scale factors and fluid clamps that flex across $320\text{px}$ to $3840\text{px}$.
- **I**nclusive: Rigorous APCA lightness polarity, CVD cone simulations, and $44\text{pt}$ touch minimums.
- **L**inear: Unbroken baseline rhythm and strict reading-order DAG traversals.
- **K**inetic: Spring physics calibrated to human motor reflexes ($150\text{ms} - 320\text{ms}$) with reduced-motion compliance.

---

## 2. Jan Tschichold's Golden Canon (Die neue Typographie)

Tschichold demonstrated that pages and screens attain subconscious optical balance when margins follow the classical progression:
$$\text{Inner} : \text{Top} : \text{Outer} : \text{Bottom} = 2 : 3 : 4 : 6$$

In responsive software interfaces:
- **Top Margin**: Moderately compact to bring vital primary actions above the fold ($3\times$).
- **Outer Margins**: Balanced to frame the content without touching screen bezels ($4\times$).
- **Bottom Margin**: Generous breathing buffer to prevent thumb cramp and bottom navigation collision ($6\times$).

---

## 3. The Base-8 Quantum Modular Grid

All vertical and horizontal intervals adhere to the quantum baseline multiple:
$$\text{Spacing}(n) = 8 \times n \quad \text{or} \quad 4 \times n \text{ for micro-steps}$$

```
Interval   Token      Value    Semantic Application
─────────────────────────────────────────────────────────────
1          space-1    4px      Sub-pixel icon/label gap
2          space-2    8px      Dense input padding, badge padding
3          space-3    12px     Compact card padding
4          space-4    16px     Standard container padding
5          space-5    24px     Section divider gutter
6          space-6    32px     Major card separation
8          space-8    48px     Macro hero whitespace
```

---

## 4. API Reference & Code Examples

### 4.1 Validating Quantum Grid Multiples
```typescript
import { validateBaseGridMultiple } from '@intuitui-labs/a11y-gate';

const result = validateBaseGridMultiple({
  valuePx: 16,
  baseGridPx: 8,
});

console.log(result.isValid); // true
console.log(result.multiplier); // 2
```

### 4.2 Tschichold Margin Calculator
```typescript
import { computeTschicholdMargins } from '@intuitui-labs/a11y-gate';

const margins = computeTschicholdMargins({
  viewportWidthPx: 390,
  viewportHeightPx: 844,
  baseUnitPx: 4,
});

console.log(margins);
// { top: 12, right: 16, bottom: 24, left: 8 }
```
