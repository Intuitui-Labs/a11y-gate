# Pure-Ratio Psychophysical Doctrine

> **Package:** `@intuitui-labs/a11y-gate`  
> **Module:** `@intuitui-labs/a11y-gate/ratio-doctrine`  
> **Theoretical Foundation:** Weber-Fechner Law, Stevens' Power Law, Tschichold Golden Canon, Apple Human Interface Guidelines, W3C APCA 0.98G  

---

## 1. Philosophical & Sensory Foundation

> *"Humans do not perceive absolute physical stimuli; humans perceive relative ratios."*

Standard accessibility suites fail modern design systems because they audit arbitrary scalar pixels ($16\text{px}$, $8\text{px}$, $4.5:1$). However, the human sensory apparatus (visual cortex, foveal photoreceptors, lateral geniculate nucleus) operates strictly through differential relative ratios:

1. **Weber-Fechner Law ($\Delta I / I = k$)**:
   The perceived change in sensory intensity is proportional to the initial stimulus intensity. A $4\text{px}$ gap inside an $8\text{px}$ badge feels enormous; a $4\text{px}$ gap inside a $320\text{px}$ hero card is visually imperceptible.
2. **Stevens' Power Law ($\psi = k \cdot I^\alpha$)**:
   The relationship between physical stimulus magnitude ($I$) and perceived subjective sensation ($\psi$) follows a power curve. For visual area perception, $\alpha \approx 0.70 - 0.85$.
3. **Modulation Transfer Function (MTF) & Retinal Diffraction**:
   The optics of the human cornea and crystalline lens act as a low-pass optical filter. When typographic stem stroke width falls below $1.25\text{px}$, high-frequency retinal diffraction causes optical vibration and character disintegration on high-DPI OLED screens.

---

## 2. Multi-Scale Ratio Hierarchy

The doctrine partitions visual and spatial layouts into three nested ratio orders:

```
┌────────────────────────────────────────────────────────┐
│ MACRO RATIO: Canvas Margins (≥ 4%), Whitespace (≥ 30%) │
│  ┌──────────────────────────────────────────────────┐  │
│  │ MESO RATIO: Gutter/Padding (≥ 0.75),             │  │
│  │             Concentric Radius (R_in = R_out - P),│  │
│  │             Touch Target Envelope (≥ 44pt)       │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ MICRO RATIO: Gestalt Proximity (≥ 1.50),   │  │  │
│  │  │              Heading Clinging (≥ 2.00),    │  │  │
│  │  │              Stem Width Floor (≥ 1.25px),  │  │  │
│  │  │              Non-Uniform Dynamic Type (α)  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Specifications

### 3.1 Macro Ratios
- **Canvas Boundary Margin Ratio**:
  $$\text{Margin Ratio} = \frac{\text{Margin}_{\text{horizontal}}}{\text{Viewport}_{\text{width}}} \ge 0.04 \quad (4\% \text{ to } 8\%)$$
  Prevents visual claustrophobia and thumb bezel clipping on edge-to-edge mobile devices.
- **Whitespace Breathing Ratio**:
  $$\text{Whitespace Ratio} = \frac{\text{Viewport Area} - \sum \text{Interactive Elements Area}}{\text{Viewport Area}} \ge 0.30$$
  Guarantees resting zones for visual saccades and keeps the Cognitive Clutter Index ($CCI < 0.40$).

### 3.2 Meso Ratios
- **Spatial Inequality Ratio**:
  $$\text{Hierarchy Ratio} = \frac{\text{Inter-Container Gutter}}{\text{Intra-Container Padding}} \ge 0.75$$
  Prevents adjacent cards or sections from visually fusing into an undifferentiated mass.
- **Concentric Corner Radius Canon (Apple & Swiss Canon)**:
  $$R_{\text{inner, ideal}} = \max(0, R_{\text{outer}} - \text{Padding})$$
  Nested containers with rounded corners must share the exact geometric curvature center. If $|R_{\text{inner}} - R_{\text{inner, ideal}}| > 2\text{px}$, the eye detects optical buckling, uneven border strokes, and distorted geometry.
- **Focus Ring Geometry & Thickness Ratio (WCAG 2.2 SC 2.4.13)**:
  $$\text{Focus Stroke} \ge 2.0\text{px}, \quad \text{Focus Offset Gap} \ge 2.0\text{px}, \quad \frac{\text{Focus Stroke}}{\text{Element Border}} \ge 1.5$$
  The focus indicator must not occlude or meld into the control boundary.
- **Canonical Harmonic Aspect Ratios**:
  Validates containers against classical geometric ratios with a $5\%$ tolerance:
  - `SQUARE`: $1.000$ ($1:1$)
  - `CLASSIC_4_3`: $1.333$ ($4:3$)
  - `SILVER_RATIO`: $1.414$ ($1:\sqrt{2}$, DIN ISO 216 paper standard)
  - `PHOTO_3_2`: $1.500$ ($3:2$, 35mm photography)
  - `GOLDEN_RATIO`: $1.618$ ($\phi$, divine proportion)
  - `WIDESCREEN_16_9`: $1.778$ ($16:9$, cinematic hero modules)

### 3.3 Micro Ratios
- **Gestalt Proximity Ratio**:
  $$\text{Proximity Ratio} = \frac{\text{Input to Next Section Gap}}{\text{Label to Input Gap}} \ge 1.50 \quad (\text{Optimal } 2.50)$$
  Ensures input fields visually bond to their corresponding label rather than floating towards the preceding component.
- **Heading Clinging Ratio**:
  $$\text{Clinging Ratio} = \frac{\text{Heading MarginTop}}{\text{Heading MarginBottom}} \ge 2.00 \quad (\text{Optimal } 3.00)$$
  Headings must physically cling to the content they introduce, rather than hovering neutrally or clinging to the previous block.
- **Non-Uniform Dynamic Type Power Law (Stevens' Law)**:
  $$S_{\text{scaled}} = S_{\text{base}} \times (\text{ScaleFactor})^\alpha$$
  - `display`: $\alpha = 0.65$ (sub-linear, prevents viewport clipping)
  - `title`: $\alpha = 0.78$ (sub-linear, maintains headline cohesion)
  - `body`: $\alpha = 1.05$ (near-linear, comfortable reading speed)
  - `caption`: $\alpha = 1.22$ (super-linear, protects low-vision readers from character drop-out)
- **Optical Stem Thickness Floor**:
  $$W_{\text{stem}} = \text{FontSize} \times \left(0.06 + \frac{\text{FontWeight}}{1000} \times 0.16\right) \ge 1.25\text{px}$$
  Bans anemic 7px–9px micro-fonts with 400 weight that collapse into pixel blur on modern displays.
- **Chromostereopsis Aberration Hazard**:
  Juxtaposition of high-saturation pure red ($R > 190, G,B < 80$) and pure blue/cyan ($B > 190, R < 80$) at adjacent borders triggers severe retinal chromatic dispersion, causing text to vibrate or appear on discordant depth planes.

---

## 4. API Reference & Code Examples

### 4.1 Auditing an Entire Screen Layout
```typescript
import { auditPsychophysicalRatios } from '@intuitui-labs/a11y-gate';

const result = auditPsychophysicalRatios({
  viewportWidthPx: 390,
  viewportHeightPx: 844,
  canvasMarginHorizontalPx: 20, // 5.1% (>= 4%)
  contentWidthPx: 350,

  interContainerGutterPx: 16,
  intraContainerPaddingPx: 16, // 1.00 (>= 0.75)

  labelToInputGapPx: 6,
  inputToNextGroupGapPx: 18, // 3.00 (>= 1.50)

  headingMarginTopPx: 24,
  headingMarginBottomPx: 8, // 3.00 (>= 2.00)

  fontSizePx: 15,
  fontWeight: 500,
  lineHeightPx: 24, // 1.60 leading
  colorHex: '#0F172A',
  bgHex: '#FFFFFF', // APCA Lc ~100
  role: 'body',

  touchHitDimensionPx: 48,
  visualGlyphDimensionPx: 20,
});

console.log(result.passes); // true
console.log(result.score);  // 100
```

### 4.2 Non-Uniform Dynamic Type Calculation
```typescript
import { computeNonUniformDynamicScale } from '@intuitui-labs/a11y-gate';

// Low-vision user selects 1.6x OS accessibility text size:
const headline = computeNonUniformDynamicScale({
  baseFontSizePx: 34,
  scaleFactor: 1.6,
  role: 'display',
});
console.log(headline.scaledFontSizePx); // 46.1px (sub-linear dampening)

const caption = computeNonUniformDynamicScale({
  baseFontSizePx: 12,
  scaleFactor: 1.6,
  role: 'caption',
});
console.log(caption.scaledFontSizePx); // 21.3px (super-linear boost)
```

### 4.3 Concentric Corner Radius Audit
```typescript
import { auditConcentricCornerRadius } from '@intuitui-labs/a11y-gate';

const card = auditConcentricCornerRadius({
  outerRadiusPx: 24,
  innerRadiusPx: 8,
  paddingPx: 16, // 24 - 16 = 8px ideal
});

console.log(card.passes); // true
console.log(card.idealInnerRadiusPx); // 8
```
