# Convolutional Spatial Affordance Matrix

> **Package:** `@intuitui-labs/a11y-gate`  
> **Module:** `@intuitui-labs/a11y-gate/convolutional-spatial`  
> **Theoretical Foundation:** 2D Discrete Convolution, Graph Theory Directed Acyclic Graphs (DAG), Human Fitts' Law, Multi-Scale Hit Testing  

---

## 1. Overview & Architectural Motivation

Traditional accessibility tools view screens as a flat DOM tree or linear text list. In contrast, real human eyes and motor systems navigate a **two-dimensional physical topology**.

The Convolutional Spatial Matrix engine projects screen components into a discrete spatial grid, computing:
1. **Interactive Touch Overlap Kernels ($K_{\text{overlap}}$)**: Detecting whether adjacent buttons, inputs, or badges create overlapping hit target zones that cause accidental taps.
2. **Visual Occlusion Graphs**: Detecting floating toolbars, sticky headers, bottom sheets, or toast notifications that occlude interactive elements.
3. **Reading Flow DAGs (Directed Acyclic Graphs)**: Validating that the visual reading order (Western top-to-bottom, left-to-right) conforms with accessibility focus order without zig-zag cognitive disorientation.

---

## 2. Convolutional Kernel Mechanics

### 2.1 The Spatial Kernel Matrix
The screen is discretized into a normalized spatial bounding box matrix:
$$M(x, y) \in \{0, 1\}$$
where $1$ represents an interactive or textual bounding footprint.

A discrete touch buffer kernel $K$ (e.g., $44 \times 44\text{pt}$ touch envelope) is convolved over the element centers:
$$(M * K)(x, y) = \sum_{i} \sum_{j} M(x - i, y - j) \cdot K(i, j)$$

Where the convolved values exceed $1.0$, a **spatial collision hazard** is flagged.

### 2.2 Visual Reading Order DAG
Every node in the viewport is assigned coordinates $(x, y, w, h)$. Directed edges are established based on:
1. **Vertical Precedence**: Node $A$ precedes Node $B$ if $A_y + A_h \le B_y$.
2. **Horizontal Precedence (within row band)**: If vertical overlap $\ge 60\%$, Node $A$ precedes Node $B$ if $A_x < B_x$.

A topological sort evaluates whether screen traversal contains cognitive reversals or un-grouped jumps.

---

## 3. API Reference & Code Examples

### 3.1 Auditing 2D Spatial Layout
```typescript
import { auditSpatialLayout } from '@intuitui-labs/a11y-gate';

const elements = [
  { id: 'btn-prev', x: 20, y: 700, width: 100, height: 44, role: 'button' },
  { id: 'btn-next', x: 110, y: 700, width: 100, height: 44, role: 'button' }, // 10px overlap!
];

const audit = auditSpatialLayout({
  viewport: { width: 390, height: 844 },
  elements,
  minTouchTargetPx: 44,
});

console.log(audit.hasTouchCollisions); // true
console.log(audit.collisions);
// [ { a: 'btn-prev', b: 'btn-next', overlapPx: 10 } ]
```

### 3.2 Reading Flow DAG Verification
```typescript
import { verifyReadingFlowDag } from '@intuitui-labs/a11y-gate';

const result = verifyReadingFlowDag({
  viewportWidth: 390,
  nodes: [
    { id: 'header', x: 20, y: 40, width: 350, height: 32 },
    { id: 'input-email', x: 20, y: 100, width: 350, height: 48 },
    { id: 'input-password', x: 20, y: 168, width: 350, height: 48 },
    { id: 'submit-cta', x: 20, y: 240, width: 350, height: 48 },
  ],
});

console.log(result.isConforming); // true
console.log(result.topologicalOrder); // ['header', 'input-email', 'input-password', 'submit-cta']
```
