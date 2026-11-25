import { describe, it, expect } from 'vitest';
import { runCli } from '../src/cli.js';

describe('a11y-gate CLI Engine', () => {
  it('displays help and exits with 0 on help command', () => {
    const code = runCli(['help']);
    expect(code).toBe(0);
  });

  it('displays version and exits with 0 on version command', () => {
    const code = runCli(['version']);
    expect(code).toBe(0);
  });

  it('generates modular typographic scale on scale command', () => {
    const code = runCli(['scale', '--base', '16', '--ratio', 'major-third', '--json']);
    expect(code).toBe(0);
  });

  it('evaluates contrast and passes with 0 on high APCA contrast', () => {
    const code = runCli(['contrast', '--fg', '#000000', '--bg', '#FFFFFF', '--json']);
    expect(code).toBe(0);
  });

  it('evaluates proportional spacing and passes with 0 on Gold spec', () => {
    const code = runCli([
      'spacing',
      '--size', '16',
      '--line-height', '24',
      '--tracking', '0.005em',
      '--padding', '24',
      '--gap', '16',
      '--json',
    ]);
    expect(code).toBe(0);
  });

  it('blocks CI with code 1 when crushed leading violates hard baseline', () => {
    const code = runCli([
      'spacing',
      '--size', '16',
      '--line-height', '18',
      '--role', 'body',
      '--json',
    ]);
    expect(code).toBe(1);
  });

  it('blocks CI with code 1 when mobile body font size violates 16px iOS floor', () => {
    const code = runCli([
      'role',
      '--name', 'body',
      '--size', '14',
      '--mobile',
      '--json',
    ]);
    expect(code).toBe(1);
  });

  it('passes when mobile body font size is 16px', () => {
    const code = runCli([
      'role',
      '--name', 'body',
      '--size', '16',
      '--mobile',
      '--json',
    ]);
    expect(code).toBe(0);
  });
});
