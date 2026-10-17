/**
 * @intuitui-labs/a11y-gate
 * Mathematical accessibility, APCA contrast, Color Vision Deficiency (CVD) simulation,
 * spatial harmony, tactile motion architecture, mobile visual audits, WCAG 3 candidate models,
 * multi-scale convolutional layout, cognitive saliency, and platform-specific validation.
 */

export * from './token-types.js';
export * from './contrast-math.js';
export * from './cvd-simulator.js';
export * from './spatial-math.js';
export * from './motion-tactile.js';
export * from './mobile-audit.js';
export * from './platform-audit.js';
export * from './test-runner.js';
export * from './wcag3.js';
export * from './mobile/index.js';

export * from './swiss-silk.js';
export * from './axe-baseline.js';
export * from './convolutional-spatial.js';
export * from './standards-matrix.js';
export * from './cognitive-saliency.js';
export * from './ratio-doctrine.js';
export * from './hotspot-diversity.js';
export * from './comprehensive-gate.js';
export * from './schema-adapter.js';

// Creative cognition additions
export {
  auditCvdDualEncoding,
  evaluateCognitiveEntropy,
  evaluateCtaVisualDominance,
  evaluatePolarThumbArc,
  type CvdStateSpec,
  type CvdDualEncodingResult,
  type ViewportEntropySpec,
  type CognitiveEntropyResult,
  type InteractiveVisualTarget,
  type CtaDominanceResult,
  type MobileThumbTarget,
  type ThumbZoneErgonomicsResult,
} from './creative-cognition.js';
