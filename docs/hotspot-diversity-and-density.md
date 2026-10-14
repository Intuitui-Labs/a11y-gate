# Hotspot Dynamics, Affordance Diversity & Adaptive Density

> **Package:** `@intuitui-labs/a11y-gate`  
> **Module:** `@intuitui-labs/a11y-gate/cognitive-saliency` & `@intuitui-labs/a11y-gate/ratio-doctrine`  
> **Theoretical Foundation:** Cognitive Load Theory (Sweller), Sensory Repetition Suppression, Fitts' Law, Visual Saccadic Navigation, Modern Adaptive Density Systems  

---

## 1. Executive Summary: The Cognitive Triad

Accessibility in modern form design extends beyond basic contrast ratios and static pixel sizes. The holistic usability of a form is governed by the **Cognitive Triad**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE COGNITIVE TRIAD OF FORM UX                       │
│                                                                        │
│   1. INFORMATION DENSITY ───> How much intent is resolved per screen? │
│   2. VISUAL DIVERSITY    ───> How varied are interactive modalities?   │
│   3. INTERACTION HOTSPOTS───> Where does the foveal gaze lock onto?    │
└────────────────────────────────────────────────────────────────────────┘
```

When an interface gets the baseline hygiene right (contrast, typography, concentric borders) but ignores this triad, it falls into **The Grey Soup Syndrome**: an undifferentiated, monotonous stack of identical white boxes that induces cognitive fatigue, repetition suppression, and high abandonment rates.

---

## 2. Core Concepts & Neurological Foundations

### 2.1 Repetition Suppression & Affordance Diversity
In cognitive neuroscience, **repetition suppression** is the reduction of neural activity in sensory processing areas when the brain is repeatedly exposed to identical stimuli.
- When a user encounters 8 identical rectangular single-line text inputs in a row, neural responsiveness declines sharply by field 4.
- The user begins skimming, misses validation constraints, and perceives the interaction as onerous labor.
- **Affordance Diversity** solves this by rotating interaction modalities across distinct ergonomic channels:
  - *Typing* (Unstructured free text: Name, Email)
  - *Tapping* (Discrete bounded choice: Segmented pills, toggle chips)
  - *Scrubbing* (Continuous intensity: Sliders, Likert scales)
  - *Picking / Searching* (Composite structures: Address autocomplete, calendar date pickers)
  - *Dual-Column Coupling* (Tightly linked attributes: City + Zip, Expiry + CVC)

### 2.2 Interaction Hotspots & Saccadic Scanpaths
Human visual search does not read forms sequentially like prose. The eye executes rapid **saccadic jumps** between high-salience visual anchors ("hotspots").
- **Focal Anchor Law**: Every form screen must have exactly **one primary focal anchor** (the active focused field or primary action CTA) and **secondary micro-hotspots** (quick-fill chips, calendar button, status pill).
- **Attentional Competition**: If decorative elements, badges, or passive labels have higher visual salience than the primary interactive hotspot, an **Attention Hijack** occurs, disorienting the user.

### 2.3 Adaptive Information Density
Information density is the ratio of resolved business intent per screen unit:
- **Under-Density**: Giant cards with excessive padding force endless vertical scrolling, causing *vertical working memory decay* (the user forgets earlier inputs).
- **Over-Density**: Crowded data grids without spatial grouping trigger visual claustrophobia and fat-finger touch errors.
- **Adaptive Density Matrix**:
  - `spacious` ($56\text{px}$ input, $24\text{px}$ padding): High-consideration onboarding, authentication, payment checkout.
  - `balanced` ($48\text{px}$ input, $16\text{px}$ padding): Standard multi-step consumer and mobile forms.
  - `compact` ($38\text{px}$ input, $10\text{px}$ padding, $44\text{px}$ hit slop): Enterprise back-office, inspection checklists, data-dense review tables.

---

## 3. Mathematical Specifications

### 3.1 Affordance Diversity Quotient (ADQ)
Quantifies the variety of interactive modalities within a step:
$$\text{ADQ} = \frac{|\text{Unique Interaction Modalities}|}{\text{Total Interactive Fields in Step}}$$

Where modalities are classified as:
$$\text{Modalities} \subseteq \{\text{'text-typing'}, \text{'tap-pill'}, \text{'dual-column'}, \text{'scrubbing-slider'}, \text{'date-preset'}, \text{'picker-search'}, \text{'attachment'}\}$$

- **Thresholds**:
  - $\text{ADQ} \ge 0.40$: **Optimal Diversity**. Highly engaging, varied motor actions.
  - $0.25 \le \text{ADQ} < 0.40$: **Acceptable**. Standard form.
  - $\text{ADQ} < 0.25$ (with $> 4$ fields): **Interaction Monotony Hazard**. Flagged for severe repetition suppression.

### 3.2 Hotspot Focal Saliency & Dispersion Index (HSDI)
Measures the attention ratio between the active focal hotspot and inactive fields:
$$\text{Hotspot Ratio} = \frac{\text{Salience}(\text{Active Focal Element})}{\frac{1}{N} \sum_{i=1}^N \text{Salience}(\text{Inactive Field}_i)} \ge 2.20$$

Where optical salience is computed by:
$$\text{Salience} = \sqrt{\text{Area}} \times \left(\frac{\text{FontWeight}}{400}\right)^{0.75} \times \left(\frac{\text{APCA } L_c}{60}\right) \times \text{ElevationMultiplier}$$

- Ensures the user's foveal focus is drawn decisively to the active point of interaction.

### 3.3 Touch Target Density Floor (Fitts' Law)
Even in `compact` density mode ($38\text{px}$ visual height), the physical hit target envelope must maintain the $44\times 44\text{pt}$ minimum using negative hit slop:
$$\text{HitSlop}_{\text{vertical}} \ge \frac{44 - 38}{2} = 3\text{px} \text{ on each side}$$

---

## 4. API Reference

```typescript
import {
  auditAffordanceDiversity,
  auditHotspotDispersion,
  auditAdaptiveDensity,
} from '@intuitui-labs/a11y-gate';

// 1. Audit Affordance Diversity
const diversity = auditAffordanceDiversity({
  stepId: 'personal-info',
  fieldModalities: [
    'text-typing',      // Name
    'text-typing',      // Email
    'picker-search',    // Address
    'tap-pill',         // Preferred Contact Method
    'date-preset',      // Move-in Date
  ],
});
console.log(diversity.adq); // 4 unique / 5 fields = 0.80 (Optimal!)
console.log(diversity.passes); // true

// 2. Audit Hotspot Dispersion
const hotspot = auditHotspotDispersion({
  activeElementSalience: 185.0,
  averageInactiveSalience: 72.0,
});
console.log(hotspot.ratio); // 2.57 (>= 2.20 floor)
console.log(hotspot.passes); // true

// 3. Audit Adaptive Density
const density = auditAdaptiveDensity({
  mode: 'compact',
  visualHeightPx: 38,
  touchEnvelopePx: 44,
});
console.log(density.passes); // true (Satisfies 44px hit floor via hit slop)
```
