import { describe, it, expect } from 'vitest';
import {
  getWcagContrastRatio,
  getContrastPolarity,
  evaluateWcag3,
  checkMobileTouchTarget,
  getTouchHitSlop,
  validateDynamicTypography,
  getBestText,
  calculateApca,
  getApcaFontMatrix,
  simulateCvd,
  generateFluidClamp,
  SPRING_PRESETS,
  getInterpolatedMotion,
  generateAmbientGlowCss,
  runA11ySuite,
  auditReactNativeScreen,
  runReactNativeScreenAuditSuite,
} from '../src/index';

describe('@intuitui-labs/a11y-gate Core Package', () => {
  it('computes exact WCAG 2.2 contrast ratio', () => {
    expect(getWcagContrastRatio('#000000', '#ffffff')).toBe(21);
  });

  it('computes APCA contrast and font lookup matrix', () => {
    const lc = calculateApca('#000000', '#ffffff');
    expect(Math.abs(lc)).toBeGreaterThanOrEqual(100);
    const matrix = getApcaFontMatrix(Math.abs(lc));
    expect(matrix.w400).toBe(14);
    expect(matrix.w700).toBe(11);
  });

  it('simulates color vision deficiency accurately', () => {
    const gray = simulateCvd('#2563eb', 'achromatopsia');
    expect(gray.r).toBe(gray.g);
    expect(gray.g).toBe(gray.b);
  });

  it('generates mathematical fluid clamps', () => {
    const clamp = generateFluidClamp({ minSizePx: 16, maxSizePx: 24 });
    expect(clamp).toContain('clamp(');
  });
});

describe('Motion & Tactile Physics Architecture', () => {
  it('provides calibrated spring presets across subtle, tactile, and expressive tiers', () => {
    expect(SPRING_PRESETS.subtle.durationMs).toBe(150);
    expect(SPRING_PRESETS.tactile.durationMs).toBe(220);
    expect(SPRING_PRESETS.expressive.durationMs).toBe(320);

    // Active scale progression must compress more with higher intensity
    expect(SPRING_PRESETS.subtle.activeScale).toBeGreaterThan(SPRING_PRESETS.tactile.activeScale);
    expect(SPRING_PRESETS.tactile.activeScale).toBeGreaterThan(SPRING_PRESETS.expressive.activeScale);
  });

  it('calculates smooth continuous gradient motion interpolation (0.0 to 1.0)', () => {
    const zero = getInterpolatedMotion(0);
    expect(zero.activeScale).toBe(1);
    expect(zero.durationMs).toBe(100);

    const half = getInterpolatedMotion(0.5);
    expect(half.activeScale).toBe(0.975);
    expect(half.durationMs).toBe(210);

    const full = getInterpolatedMotion(1.0);
    expect(full.activeScale).toBe(0.95);
    expect(full.durationMs).toBe(320);
  });

  it('generates ambient radial glow CSS parameter strings', () => {
    const glow = generateAmbientGlowCss({ xPercent: 45, yPercent: 60, radiusPx: 400 });
    expect(glow).toContain('radial-gradient(400px circle at 45% 60%');
  });
});

describe('React Native Screen Qualitative & Ergonomics Audit Gate', () => {
  it('catches sub-14px micro-text, undersized touch targets, and cognitive friction', () => {
    const badScreen = `
      export function FlawedWelcome() {
        return (
          <View className="p-4">
            <Text className="text-[10px] text-gray-500">Sub 14px caption</Text>
            <Pressable className="py-1 px-2 bg-blue-500 rounded">
              <Text className="text-[10px]">Tiny Button</Text>
            </Pressable>
            <Checkbox value="terms" />
          </View>
        );
      }
    `;

    const result = auditReactNativeScreen(badScreen, 'FlawedWelcome');
    expect(result.hasErrors).toBe(true);
    expect(result.isCompliant).toBe(false);

    const typo = result.findings.find((f) => f.rule === 'MOBILE_TYPOGRAPHY_FLOOR_14PX');
    expect(typo).toBeDefined();

    const touch = result.findings.find((f) => f.rule === 'TOUCH_TARGET_48DP_UNDERSIZED');
    expect(touch).toBeDefined();

    const friction = result.findings.find((f) => f.rule === 'COGNITIVE_FRICTION_CHECKBOX');
    expect(friction).toBeDefined();
  });

  it('passes compliant mobile screens with >= 14px text and >= 48dp touch bounds', () => {
    const goodScreen = `
      export function ElegantSanctuaryWelcome() {
        return (
          <View className="flex-1 px-6 py-12">
            <Text className="text-xl font-bold text-ink">Gurudevi Sanctuary</Text>
            <Text className="text-base text-bark leading-relaxed">
              A serene space for educators to breathe and grow.
            </Text>
            <Pressable
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="h-[52px] rounded-2xl bg-amber justify-center items-center"
              accessibilityRole="button"
              accessibilityLabel="Explore as Guest"
            >
              <Text className="text-base font-semibold text-white">Begin Journey</Text>
            </Pressable>
          </View>
        );
      }
    `;

    const result = auditReactNativeScreen(goodScreen, 'ElegantSanctuaryWelcome');
    expect(result.hasErrors).toBe(false);
    expect(result.isCompliant).toBe(true);
  });
});

// Universal test runner integration
runA11ySuite(
  {
    name: 'Package Self-Test Suite',
    tokens: [
      {
        id: 'test-high-contrast',
        name: 'Black on White',
        fg: '#000000',
        bg: '#ffffff',
        expectedWcagMin: 7.0,
        expectedApcaMin: 90,
      },
    ],
  },
  { describe, it, expect }
);

// Mobile visual & ergonomics audit verification
import { runMobileAuditSuite } from '../src/index';

runMobileAuditSuite(
  {
    name: 'Package Mobile Self-Test',
    htmlPages: [
      {
        path: 'mock-mobile.html',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
            </head>
            <body>
              <button id="mobile-menu-btn" aria-expanded="false" class="touch-target">Menu</button>
              <div id="mobile-drawer" role="dialog" aria-modal="true">
                <a href="/about" class="touch-target">About</a>
              </div>
            </body>
          </html>
        `,
      },
    ],
  },
  { describe, it, expect }
);

// Platform-aware suite verification
import { runPlatformSuite, detectCurrentRuntime } from '../src/index';

runPlatformSuite(
  {
    platform: 'universal',
    html: '<a href="#main-content" class="skip-link">Skip</a><meta name="viewport" content="width=device-width, viewport-fit=cover"><main class="max-w-4xl measure-optimal"><button class="touch-target">Action</button></main>',
    css: '.touch-target { min-height: 48px; } html { -webkit-tap-highlight-color: transparent; }',
    tokens: [
      { id: 'token-test', name: 'Contrast', fg: '#000000', bg: '#ffffff', expectedWcagMin: 4.5 },
    ],
  },
  { describe, it, expect }
);

describe('Runtime Detector', () => {
  it('identifies current execution runtime', () => {
    const runtime = detectCurrentRuntime();
    expect(['node', 'browser', 'react-native']).toContain(runtime);
  });
});


describe('WCAG 3 / APCA Exhaustive Conformance Engine (src/wcag3.ts)', () => {
  it('identifies contrast polarity accurately (BoW vs WoB)', () => {
    // Dark text on light background -> BoW
    expect(getContrastPolarity('#111827', '#ffffff')).toBe('BoW');
    // Light text on dark background -> WoB
    expect(getContrastPolarity('#ffffff', '#111827')).toBe('WoB');
  });

  it('evaluates Gold, Silver, Bronze, and Component tiers', () => {
    const gold = evaluateWcag3('#000000', '#ffffff');
    expect(gold.level).toBe('Gold');
    expect(gold.passesRole.body).toBe(true);
    expect(gold.passesRole.headline).toBe(true);

    const silver = evaluateWcag3('#475569', '#ffffff'); // medium slate
    expect(['Silver', 'Gold']).toContain(silver.level);

    const lowContrast = evaluateWcag3('#94a3b8', '#ffffff'); // light slate
    expect(lowContrast.passesRole.body).toBe(false);
  });

  it('provides exhaustive font size recommendations across w100 to w900', () => {
    const res = evaluateWcag3('#000000', '#ffffff');
    expect(res.minFontMatrix.w100).toBeGreaterThan(res.minFontMatrix.w400);
    expect(res.minFontMatrix.w400).toBeGreaterThanOrEqual(res.minFontMatrix.w700);
    expect(res.minFontMatrix.w700).toBeGreaterThanOrEqual(res.minFontMatrix.w900);
  });
});

describe('Headless Mobile & Touch Ergonomics (src/mobile/index.ts)', () => {
  it('checks mobile touch targets with strict 48dp and compact 44pt standards', () => {
    const iconOnly = checkMobileTouchTarget(24, 24, 'strict');
    expect(iconOnly.passes).toBe(false);
    expect(iconOnly.deficiency.width).toBe(24);
    expect(iconOnly.deficiency.height).toBe(24);
    expect(iconOnly.recommendedHitSlop.top).toBe(12);
    expect(iconOnly.recommendedHitSlop.left).toBe(12);

    const fullButton = checkMobileTouchTarget(48, 48, 'strict');
    expect(fullButton.passes).toBe(true);
    expect(fullButton.deficiency.width).toBe(0);
  });

  it('calculates touch hitSlop defensively', () => {
    const hitSlop = getTouchHitSlop(24, 24, 48);
    expect(hitSlop).toEqual({ top: 12, bottom: 12, left: 12, right: 12 });
  });

  it('validates dynamic typography and warns on sub-14px micro floors', () => {
    const valid = validateDynamicTypography(16, 1.5);
    expect(valid.passesFloor).toBe(true);
    expect(valid.scaledSizePx).toBe(24);
    expect(valid.isComfortable).toBe(true);
    expect(valid.warning).toBeUndefined();

    const subFloor = validateDynamicTypography(12, 1.0);
    expect(subFloor.passesFloor).toBe(false);
    expect(subFloor.warning).toContain('below minimum readable floor');

    const extremeScale = validateDynamicTypography(16, 3.0);
    expect(extremeScale.isComfortable).toBe(false);
    expect(extremeScale.warning).toContain('exceeds comfortable mobile layout');
  });

  it('picks the best contrast text color prioritizing APCA score', () => {
    const darkBgText = getBestText('#090d16', ['#2A2318', '#FCF9F2', '#FFFFFF', '#000000']);
    expect(['#FFFFFF', '#FCF9F2']).toContain(darkBgText);

    const lightBgText = getBestText('#ffffff', ['#2A2318', '#FCF9F2', '#FFFFFF', '#000000']);
    expect(['#000000', '#2A2318']).toContain(lightBgText);
  });
});
