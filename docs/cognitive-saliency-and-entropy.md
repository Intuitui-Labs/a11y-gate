# Cognitive Saliency & Visual Clutter Architecture

> **Package:** `@intuitui-labs/a11y-gate`  
> **Module:** `@intuitui-labs/a11y-gate/cognitive-saliency`  
> **Theoretical Foundation:** Shannon Information Entropy ($H$), Cognitive Clutter Index ($CCI$), Dual-Encoding Redundancy, Saliency Map Weighting  

---

## 1. Overview & Core Philosophy

Accessibility isn't solely about color blindness or motor dexterity; **cognitive accessibility** governs whether neurodivergent users, stressed users, or elderly users can navigate an interface without cognitive exhaustion.

This engine provides mathematical metrics for:
1. **Cognitive Clutter Index ($CCI$)**: Quantifying the perceptual density and bounding box noise of an interface.
2. **Visual Scanpath Entropy ($H_{\text{scanpath}}$)**: Quantifying the chaos of the eye's visual search path.
3. **Dual-Encoding Audit**: Ensuring state indicators (errors, warnings, successes) are never communicated by color alone.

---

## 2. Mathematical Formulations

### 2.1 Cognitive Clutter Index ($CCI$)
Let $N$ be the number of discrete visual elements in viewport area $A$. Let $D_i$ be the semantic saliency depth of element $i$.
$$CCI = \frac{\sum_{i=1}^N \text{Area}_i \cdot \text{VisualWeight}_i}{A_{\text{viewport}}} \times \log_2(N + 1)$$

- **$CCI < 0.35$**: Clean, calm, focused interface (Apple/Swiss archetype).
- **$0.35 \le CCI \le 0.50$**: Moderate density (acceptable for power-user data tables).
- **$CCI > 0.50$**: Cognitive overload. Triggers form abandonment and attention drift.

### 2.2 Shannon Visual Entropy ($H_{\text{layout}}$)
Measures the spatial uncertainty across vertical and horizontal grid lines:
$$H = -\sum_{k} p_k \log_2 p_k$$
High entropy indicates fragmented column alignments, jagged line wraps, and erratic card widths.

### 2.3 Dual-Encoding Verification
In accordance with **WCAG 2.2 SC 1.4.1 (Use of Color)**:
Every state signal requires at least two orthogonal perceptual channels:
$$\text{Signal Channels} = \{\text{Color}\} \cup \{\text{Icon}, \text{Semantic Text}, \text{Border Style}, \text{Tactile Haptic}\}$$
If $|\text{Signal Channels}| < 2$, the engine flags a fatal single-channel failure.

---

## 3. API Reference & Code Examples

### 3.1 Auditing Cognitive Clutter Index ($CCI$)
```typescript
import { evaluateCognitiveClutter } from '@intuitui-labs/a11y-gate';

const result = evaluateCognitiveClutter({
  viewportAreaPx: 390 * 844,
  elementCount: 14,
  totalInkAreaPx: 95000,
});

console.log(result.cci); // 0.28
console.log(result.isCalm); // true (CCI < 0.35)
```

### 3.2 Dual-Encoding Audit
```typescript
import { auditCvdDualEncoding } from '@intuitui-labs/a11y-gate';

const fieldStatus = auditCvdDualEncoding({
  status: 'error',
  hasColorIndicator: true, // Red border
  hasIconIndicator: true,  // Alert triangle icon
  hasTextLabel: true,      // "Required field"
});

console.log(fieldStatus.isFullyAccessible); // true
console.log(fieldStatus.channelCount); // 3 (Color, Icon, Text)
```
