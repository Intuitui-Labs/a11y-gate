#!/usr/bin/env node
/**
 * @intuitui-labs/a11y-gate CLI
 * Command-line interface for mathematical accessibility, APCA contrast,
 * proportional typographic scaling, and spatial harmony audits.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  calculateApca,
  getWcagContrastRatio,
  auditProportionalSpacing,
  generateModularTypographicScale,
  auditTypographicRole,
  auditComprehensiveA11yGate,
  type ModularScalePreset,
  type CanonicalFontScaleRole,
  type ProportionalTextRole,
} from './index.js';

const VERSION = '0.3.0';

function printHelp(): void {
  console.log(`
@intuitui-labs/a11y-gate CLI v${VERSION}
Mathematical Accessibility, Pure-Ratio Psychophysics & Spatial CI Gate

USAGE:
  a11y-gate <command> [options]

COMMANDS:
  audit <file.json>          Run comprehensive a11y gate audit on a JSON spec file
  scale [options]            Generate and display a modular typographic scale
  contrast [options]         Evaluate APCA Lightness Contrast (Lc) and WCAG 2.1 ratio
  spacing [options]          Evaluate proportional typography, leading, and tracking
  role [options]             Audit font size against semantic role ergonomic constraints
  help                       Show this help message
  version                    Show CLI version

OPTIONS (scale):
  --base <px>                Base font size in px (default: 16)
  --ratio <preset|num>       Modular scale ratio: minor-third (1.200), major-third (1.250),
                             perfect-fourth (1.333), golden-ratio (1.618), or custom number
  --mobile                   Apply mobile viewport minimum legibility constraints
  --json                     Output as JSON

OPTIONS (contrast):
  --fg <hex>                 Foreground text color (e.g. #0F172A)
  --bg <hex>                 Background color (e.g. #FFFFFF)
  --role <role>              Text role: body, headline, caption, control (default: body)
  --json                     Output as JSON

OPTIONS (spacing):
  --size <px>                Font size in px (e.g. 16)
  --line-height <px>         Line-height in px (optional)
  --tracking <em|px>         Letter-spacing (e.g. 0.005em or 0.1px)
  --word-spacing <px>        Word-spacing in px (optional)
  --padding <px>             Container inner padding in px (optional)
  --gap <px>                 Container child gap in px (optional)
  --role <role>              Text role: body, headline, display, caption, micro (default: body)
  --mobile                   Evaluate against mobile legibility floors
  --json                     Output as JSON

OPTIONS (role):
  --name <role>              Role name: micro, caption, body_sm, body, subhead, h3, h2, h1, display
  --size <px>                Font size in px to validate
  --mobile                   Validate against mobile constraints (e.g. 16px iOS input floor)
  --json                     Output as JSON

EXAMPLES:
  a11y-gate scale --base 16 --ratio major-third
  a11y-gate contrast --fg "#0F172A" --bg "#FFFFFF"
  a11y-gate spacing --size 16 --line-height 24 --tracking 0.005em --padding 24 --gap 16
  a11y-gate role --name body --size 14 --mobile
  a11y-gate audit ./design-system-spec.json
`);
}

function parseArgs(args: string[]): { command: string; options: Record<string, string | boolean> } {
  let command = 'help';
  const options: Record<string, string | boolean> = {};

  let i = 0;
  if (args.length > 0 && !args[0].startsWith('-')) {
    command = args[0];
    i = 1;
  }

  while (i < args.length) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      command = 'help';
      i++;
    } else if (arg === '--version' || arg === '-v') {
      command = 'version';
      i++;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        options[key] = next;
        i += 2;
      } else {
        options[key] = true;
        i++;
      }
    } else {
      if (!options._target) {
        options._target = arg;
      }
      i++;
    }
  }

  return { command, options };
}

export function runCli(rawArgs: string[] = process.argv.slice(2)): number {
  const { command, options } = parseArgs(rawArgs);

  if (command === 'version' || options.version) {
    console.log(`v${VERSION}`);
    return 0;
  }

  if (command === 'help' || options.help || (!command && Object.keys(options).length === 0)) {
    printHelp();
    return 0;
  }

  switch (command) {
    case 'scale': {
      const basePx = options.base ? parseFloat(String(options.base)) : 16;
      const ratio = options.ratio ? String(options.ratio) : 'major-third';
      const isMobile = Boolean(options.mobile);

      const parsedRatio = isNaN(Number(ratio)) ? (ratio as ModularScalePreset) : Number(ratio);
      const scale = generateModularTypographicScale({
        basePx,
        ratio: parsedRatio,
        isMobile,
      });

      if (options.json) {
        console.log(JSON.stringify(scale, null, 2));
        return 0;
      }

      console.log(`\nModular Typographic Scale (Base: ${basePx}px, Ratio: ${ratio}, Mode: ${isMobile ? 'Mobile' : 'Desktop'})`);
      console.log('─'.repeat(85));
      console.log(
        'Role'.padEnd(12) +
        'Font Size'.padEnd(12) +
        'Line Height'.padEnd(14) +
        'Leading'.padEnd(12) +
        'Tracking'.padEnd(15) +
        'Min APCA Lc'
      );
      console.log('─'.repeat(85));

      for (const [roleName, item] of Object.entries(scale)) {
        console.log(
          roleName.padEnd(12) +
          `${item.fontSizePx}px`.padEnd(12) +
          `${item.lineHeightPx}px`.padEnd(14) +
          `${item.leadingRatio.toFixed(2)}x`.padEnd(12) +
          `${item.letterSpacingEm > 0 ? '+' : ''}${item.letterSpacingEm}em`.padEnd(15) +
          `Lc >= ${item.minContrastLc}`
        );
      }
      console.log('─'.repeat(85));
      return 0;
    }

    case 'contrast': {
      const fg = String(options.fg || '#000000');
      const bg = String(options.bg || '#FFFFFF');
      const role = String(options.role || 'body');

      const apcaScore = calculateApca(fg, bg);
      const absLc = Math.abs(apcaScore);
      const wcag21Ratio = getWcagContrastRatio(fg, bg);

      let apcaTier = 'Fail';
      if (absLc >= 90) apcaTier = 'Gold';
      else if (absLc >= 75) apcaTier = 'Silver';
      else if (absLc >= 60) apcaTier = 'Bronze';
      else if (absLc >= 45) apcaTier = 'Component';

      const passesWcag21AA = wcag21Ratio >= (role === 'headline' ? 3.0 : 4.5);
      const passesWcag21AAA = wcag21Ratio >= (role === 'headline' ? 4.5 : 7.0);

      if (options.json) {
        console.log(JSON.stringify({
          fg,
          bg,
          role,
          apca: { rawScore: apcaScore, absLc, tier: apcaTier },
          wcag21: { ratio: Math.round(wcag21Ratio * 100) / 100, passesAA: passesWcag21AA, passesAAA: passesWcag21AAA },
        }, null, 2));
        return 0;
      }

      console.log(`\nContrast Evaluation: ${fg} on ${bg} (Role: ${role})`);
      console.log('─'.repeat(60));
      console.log(`W3C APCA Lightness Contrast (Lc) : ${apcaScore.toFixed(1)} (Tier: ${apcaTier})`);
      console.log(`WCAG 2.1 Contrast Ratio         : ${wcag21Ratio.toFixed(2)}:1 (AA: ${passesWcag21AA ? 'PASS' : 'FAIL'}, AAA: ${passesWcag21AAA ? 'PASS' : 'FAIL'})`);
      console.log('─'.repeat(60));
      return apcaTier === 'Fail' ? 1 : 0;
    }

    case 'spacing': {
      if (!options.size) {
        console.error('Error: --size <px> is required for spacing audit.');
        return 1;
      }

      const fontSizePx = parseFloat(String(options.size));
      const lineHeightPx = options['line-height'] ? parseFloat(String(options['line-height'])) : undefined;
      let letterSpacingEm: number | undefined;

      if (options.tracking) {
        const tr = String(options.tracking);
        if (tr.endsWith('em')) {
          letterSpacingEm = parseFloat(tr);
        } else if (tr.endsWith('px')) {
          letterSpacingEm = parseFloat(tr) / fontSizePx;
        } else {
          letterSpacingEm = parseFloat(tr);
        }
      }

      const wordSpacingPx = options['word-spacing'] ? parseFloat(String(options['word-spacing'])) : undefined;
      const containerPaddingPx = options.padding ? parseFloat(String(options.padding)) : undefined;
      const childGapPx = options.gap ? parseFloat(String(options.gap)) : undefined;
      const role = (options.role as ProportionalTextRole) || 'body';
      const isMobile = Boolean(options.mobile);

      const result = auditProportionalSpacing({
        fontSizePx,
        lineHeightPx,
        letterSpacingEm,
        wordSpacingPx,
        containerPaddingPx,
        childGapPx,
        role,
        isMobile,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return result.isHardBaselineFailure ? 1 : 0;
      }

      console.log(`\nProportional Spacing Audit (${fontSizePx}px ${role}, ${isMobile ? 'Mobile' : 'Desktop'})`);
      console.log('─'.repeat(70));
      console.log(`Conformance Tier     : ${result.level} (Score: ${result.score}/100)`);
      console.log(`Hard Baseline Status : ${result.isHardBaselineFailure ? 'FAIL (CI BLOCKED)' : 'PASS'}`);
      console.log(`Leading Ratio        : ${result.metrics.leadingRatio.toFixed(2)}x (Ideal: ${result.metrics.idealLeadingRatio}x)`);
      console.log(`Tracking             : ${result.metrics.trackingEm}em (Ideal: ${result.metrics.idealTrackingEm}em)`);

      if (result.metrics.gestaltEnclosureRatio !== undefined) {
        console.log(`Gestalt Enclosure    : ${result.metrics.gestaltEnclosureRatio.toFixed(2)} (Padding/Gap)`);
      }

      if (result.hardBaselineViolations.length > 0) {
        console.log('\nHARD BASELINE VIOLATIONS:');
        for (const v of result.hardBaselineViolations) {
          console.log(`  ✖ ${v}`);
        }
      }

      if (result.advisories.length > 0) {
        console.log('\nADVISORIES:');
        for (const a of result.advisories) {
          console.log(`  ⚠ ${a}`);
        }
      }

      if (result.remediations.length > 0) {
        console.log('\nREMEDIATIONS:');
        for (const r of result.remediations) {
          console.log(`  → ${r}`);
        }
      }
      console.log('─'.repeat(70));
      return result.isHardBaselineFailure ? 1 : 0;
    }

    case 'role': {
      if (!options.name || !options.size) {
        console.error('Error: --name <role> and --size <px> are required.');
        return 1;
      }
      const roleName = String(options.name) as CanonicalFontScaleRole;
      const sizePx = parseFloat(String(options.size));
      const isMobile = Boolean(options.mobile);

      const res = auditTypographicRole(roleName, sizePx, isMobile);

      if (options.json) {
        console.log(JSON.stringify(res, null, 2));
        return res.isHardFailure ? 1 : 0;
      }

      console.log(`\nTypographic Role Check: ${roleName} at ${sizePx}px (${isMobile ? 'Mobile' : 'Desktop'})`);
      console.log('─'.repeat(65));
      console.log(`Status        : ${res.passes ? 'PASS' : (res.isHardFailure ? 'FAIL (CI Blocked)' : 'WARNING')}`);
      console.log(`Recommended   : ${res.recommendedPx}px`);

      if (res.violations.length > 0) {
        for (const v of res.violations) {
          console.log(`  ${v}`);
        }
      }
      console.log('─'.repeat(65));
      return res.isHardFailure ? 1 : 0;
    }

    case 'audit': {
      const targetPath = String(options._target || options.file || '');
      if (!targetPath) {
        console.error('Error: specify a JSON spec file: a11y-gate audit <file.json>');
        return 1;
      }

      const resolved = path.resolve(process.cwd(), targetPath);
      if (!fs.existsSync(resolved)) {
        console.error(`Error: file not found: ${resolved}`);
        return 1;
      }

      try {
        const content = fs.readFileSync(resolved, 'utf-8');
        const spec = JSON.parse(content);

        const report = auditComprehensiveA11yGate(spec);

        if (options.json) {
          console.log(JSON.stringify(report, null, 2));
          return report.passesGate ? 0 : 1;
        }

        console.log(`\nComprehensive Accessibility Gate Audit: "${report.name}"`);
        console.log('═'.repeat(75));
        console.log(`Overall Gate Status  : ${report.passesGate ? 'PASSED' : 'FAILED (CI BLOCKED)'}`);
        console.log(`Grade                : ${report.grade}`);
        console.log(`Score                : ${report.score}/100`);
        console.log(`Baseline Grade       : ${report.baselineGrade}`);
        console.log(`WCAG 3 APCA Tier     : ${report.wcag3Tier}`);
        console.log(`Spacing Tier         : ${report.spacingTier}`);
        console.log(`Subsystems Passed    : Ratio: ${report.subsystems.ratioPassed ? 'PASS' : 'FAIL'}, Baseline: ${report.subsystems.baselinePassed ? 'PASS' : 'FAIL'}, WCAG3: ${report.subsystems.wcag3Passed ? 'PASS' : 'FAIL'}, Spacing: ${report.subsystems.spacingPassed ? 'PASS' : 'FAIL'}`);

        if (report.errors.length > 0) {
          console.log('\nCRITICAL HARD FAILURES:');
          for (const err of report.errors) {
            console.log(`  ✖ ${err}`);
          }
        }

        if (report.advisories.length > 0) {
          console.log('\nADVISORIES:');
          for (const adv of report.advisories) {
            console.log(`  ⚠ ${adv}`);
          }
        }

        if (report.remediations.length > 0) {
          console.log('\nREMEDIATIONS:');
          for (const rem of report.remediations) {
            console.log(`  → ${rem}`);
          }
        }

        console.log('═'.repeat(75));
        return report.passesGate ? 0 : 1;
      } catch (err: any) {
        console.error(`Error executing audit: ${err.message}`);
        return 1;
      }
    }

    default:
      console.error(`Unknown command: "${command}". Run "a11y-gate help" for usage.`);
      return 1;
  }
}

// Direct invocation guard
if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  const isDirectRun = process.argv[1].endsWith('cli.js') || process.argv[1].endsWith('cli.ts');
  if (isDirectRun) {
    const exitCode = runCli();
    process.exit(exitCode);
  }
}
