import { describe, expect, it } from 'vitest';
import { codeMask, generateMutants, sampleMutants } from './mutate';

const ops = (src: string) => generateMutants(src).map((m) => m.op);

describe('mutation generator', () => {
  it('flips comparisons, logic and arithmetic in real code', () => {
    const found = ops('function f(a, b) { if (a === b && a < 3) return a + 1; return 0; }');
    expect(found).toEqual(expect.arrayContaining(['eq-flip', 'and->or', 'lt->le', 'plus->minus', 'negate-if', 'return-undefined', 'int+1']));
  });

  it('negates an if condition by wrapping it, keeping the code valid', () => {
    const m = generateMutants('if (x > 1) { y(); }').find((x) => x.op === 'negate-if')!;
    expect(m.code).toBe('if (!(x > 1)) { y(); }');
  });

  it('never mutates strings, comments, template text or regex literals', () => {
    const src = ["const a = 'x === y && 1 + 2';", '// z === w + 1', 'const t = `a + b === ${c}`;', 'const r = /a+b/;'].join('\n');
    const mask = codeMask(src);
    const code = src.split('').filter((_, i) => mask[i]).join('');
    expect(code).not.toMatch(/x === y/);
    expect(code).not.toMatch(/z === w/);
    expect(code).not.toMatch(/a \+ b/);
    expect(code).toMatch(/\$\{c\}|c\}/);
    expect(ops(src)).not.toContain('eq-flip');
  });

  it('reports 1-based lines and de-duplicates identical mutants', () => {
    const ms = generateMutants('const a = 1;\nconst b = a === 2;');
    expect(ms.find((m) => m.op === 'eq-flip')!.line).toBe(2);
    expect(new Set(ms.map((m) => m.code)).size).toBe(ms.length);
  });

  it('samples deterministically and keeps one mutant per operator first', () => {
    const src = 'function f(a,b){ if (a === b && a < 3 || b > 1) return a + 1 - 2; return [1,2,3].length - 1; }';
    const all = generateMutants(src);
    const a = sampleMutants(all, 5, 'seed').map((m) => m.code);
    const b = sampleMutants(all, 5, 'seed').map((m) => m.code);
    expect(a).toEqual(b);
    expect(new Set(sampleMutants(all, 5, 'seed').map((m) => m.op)).size).toBe(5);
  });
});
