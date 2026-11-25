# Proportional Typographic & Spatial Scaling Doctrine

> Mathematical model, optical curves, canonical roles, modular scaling, and hard baseline legal enforcement for `@intuitui-labs/a11y-gate`.

---

## 1. The Perceptual Law of Proportional Scaling

Traditional design systems frequently assign arbitrary fixed values to typography and spatial intervals (e.g. static $1.5\times$ line-height or fixed $0\text{px}$ tracking across all font sizes).

However, human vision is non-linear and governed by physical optics:
* **Visual Crowding (Flom's Law)**: Small glyphs ($10\text{px} - 12\text{px}$) experience lateral masking where adjacent strokes interfere with foveal edge detection unless extra tracking ($+0.04\text{em}$ to $+0.08\text{em}$) and generous line-height ($1.62\times$) are provided.
* **Glyph Drift on Large Headings**: Large display text ($48\text{px}+$) requires negative tracking ($-0.02\text{em}$ to $-0.03\text{em}$) and tighter leading ($1.10\times$ to $1.15\times$) to prevent word boundaries from disintegrating.
* **Gestalt Enclosure Law**: Inner container padding must always exceed child gaps ($\text{Padding} \ge \text{Gap}$, ideally $\ge 1.25\times \text{Gap}$) to preserve bounded visual containers.

`@intuitui-labs/a11y-gate` implements continuous, mathematically bounded optical sizing curves to enforce these principles in automated CI gates.

---

## 2. Continuous Optical Curves

### 2.1 Optical Tracking Curve (`computeProportionalTracking`)
Tracking is scaled inversely with font size:

$$\text{Tracking}(S) = \begin{cases} 
+0.040\text{em} & S \le 12\text{px} \quad (\text{microcopy}) \\
+0.020\text{em} & 12\text{px} < S \le 14\text{px} \\
+0.005\text{em} & 14\text{px} < S \le 18\text{px} \quad (\text{body}) \\
-0.008\text{em} & 18\text{px} < S \le 28\text{px} \quad (\text{subhead}) \\
-0.015\text{em} & 28\text{px} < S \le 42\text{px} \quad (\text{headline}) \\
-0.022\text{em} & S > 42\text{px} \quad (\text{display})
\end{cases}$$

### 2.2 Optical Leading Curve (`computeProportionalLeading`)
Leading is role-aware and inversely proportional to scale:
* **Micro / Caption ($\le 13\text{px}$)**: $1.62\times$ ideal (range $1.50\times - 1.75\times$)
* **Body ($14\text{px} - 22\text{px}$)**: $1.52\times$ ideal (range $1.42\times - 1.68\times$)
* **Headlines ($24\text{px} - 47\text{px}$)**: $1.22\times$ ideal (range $1.12\times - 1.32\times$)
* **Display ($48\text{px}+$)*: $1.10\times$ ideal (range $1.05\times - 1.22\times$)

### 2.3 Proportional Word Spacing & Gestalt Enclosure
* **Word Spacing**: Ideal is $0.25\times S$. Clamped to WCAG 1.4.12 legal floor of $0.16\times S$.
* **Container Padding**: $\text{Padding} \ge 1.25\times S$.
* **Gestalt Enclosure**: $\text{Child Gap} \le 0.80\times \text{Padding}$.

---

## 3. Canonical Semantic Roles & Ergonomic Floors

Typographic scales are categorized into 9 canonical roles anchored to human visual ergonomics:

| Role | Description | Desktop Min | Mobile Min | Default | Modular Step ($n$) | APCA Floor |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `micro` | Legal terms, fine print, copyright | $11\text{px}$ | $11\text{px}$ | $11\text{px}$ | $-2$ | $Lc \ge 75$ |
| `caption` | Helper text, timestamps, tag chips | $12\text{px}$ | $12\text{px}$ | $12\text{px}$ | $-1$ | $Lc \ge 70$ |
| `body_sm` | Dense tables, secondary copy | $14\text{px}$ | $14\text{px}$ | $14\text{px}$ | $-0.5$ | $Lc \ge 65$ |
| `body` | **Primary reading copy, inputs, buttons** | **$14\text{px}$** | **$16\text{px}$** | **$16\text{px}$** | **$0$** | **$Lc \ge 60$** |
| `subhead` | Section leads, card subtitles | $18\text{px}$ | $17\text{px}$ | $20\text{px}$ | $+1$ | $Lc \ge 55$ |
| `h3` | Card titles, modal headers | $20\text{px}$ | $19\text{px}$ | $24\text{px}$ | $+2$ | $Lc \ge 50$ |
| `h2` | Major section headers | $24\text{px}$ | $22\text{px}$ | $32\text{px}$ | $+3$ | $Lc \ge 45$ |
| `h1` | Screen title, page $H_1$ | $28\text{px}$ | $26\text{px}$ | $40\text{px}$ | $+4$ | $Lc \ge 45$ |
| `display` | Hero billboard, impact stats | $36\text{px}$ | $32\text{px}$ | $56\text{px}$ | $+5$ | $Lc \ge 40$ |

---

## 4. Hard Baseline Failures (CI Gate Blockers)

Violations that flag `isHardBaselineFailure = true` and cause CI to exit with code 1:
1. **Sub-12px Font Floor (WCAG 1.4.4)**: Font size $< 12\text{px}$ desktop or $< 14\text{px}$ mobile.
2. **Mobile Input 16px Floor**: Font size $< 16\text{px}$ on mobile body/input triggers iOS Safari viewport zoom.
3. **Crushed Body Leading (WCAG 1.4.12)**: Leading ratio $< 1.30\times$ on body text causes ascenders and descenders to collide.
4. **Negative Tracking on Microcopy (WCAG 1.4.12)**: Negative letter-spacing on text $\le 14\text{px}$ causes severe glyph crowding.
5. **Word Spacing Underflow (WCAG 1.4.12)**: Word spacing $< 0.16\times \text{fontSize}$.
6. **Gestalt Enclosure Rupture**: Container padding $< 0.85\times \text{child gap}$.
7. **Reading Measure Overflow (WCAG 1.4.8 AAA)**: Line length $> 85$ characters.

---

## 5. Conformance Tiers (Gold, Silver, Bronze, Fail)

Every evaluated spec is graded using a 100-point calibrated score:
* **Gold ($\ge 90$)**: Optically pristine Swiss proportion ($\le 5\%$ variance).
* **Silver ($75 - 89$)**: Balanced standard compliance with minor acceptable variance.
* **Bronze ($60 - 74$)**: Baseline legal compliance near the lower tolerance boundary.
* **Fail ($< 60$ or any Hard Baseline Failure)**: CI gate rejection.

---

## 6. Programmatic API

```typescript
import {
  generateModularTypographicScale,
  auditProportionalSpacing,
  auditTypographicRole,
} from '@intuitui-labs/a11y-gate';

// 1. Generate full scale anchored to 16px base:
const scale = generateModularTypographicScale({
  basePx: 16,
  ratio: 'major-third', // 1.250
});

// 2. Audit an element's spacing:
const result = auditProportionalSpacing({
  fontSizePx: 16,
  lineHeightPx: 24,
  letterSpacingEm: 0.005,
  containerPaddingPx: 24,
  childGapPx: 16,
  role: 'body',
});

console.log(result.level); // 'Gold'
console.log(result.isHardBaselineFailure); // false

// 3. Validate role constraints:
const roleAudit = auditTypographicRole('body', 14, /* isMobile */ true);
console.log(roleAudit.isHardFailure); // true (violates 16px mobile floor)
```

---

## 7. CLI Usage

Generate modular scales or audit spacing directly from the terminal:

```bash
# Generate scale table
npx a11y-gate scale --base 16 --ratio major-third

# Audit proportional spacing
npx a11y-gate spacing --size 16 --line-height 24 --tracking 0.005em --padding 24 --gap 16

# Validate role constraints
npx a11y-gate role --name body --size 14 --mobile
```
