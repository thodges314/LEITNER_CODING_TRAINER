import { describe, expect, it } from 'vitest';
import { injectLoopGuards } from './loopGuards';

describe('injectLoopGuards', () => {
  it('injects guard into while loop and terminates synchronous infinite loop', () => {
    const code = `
      function infinite() {
        while (true) {}
      }
    `;
    const transformed = injectLoopGuards(code, 50);
    expect(transformed).toContain('__lp_start_1');
    expect(transformed).toContain('infinite loop detected');

    const fn = new Function(`${transformed}; return infinite;`)();
    expect(() => fn()).toThrowError(/Execution timed out after 50ms \(infinite loop detected\)/);
  });

  it('injects guard into for loop', () => {
    const code = `
      function infiniteFor() {
        for (;;) {}
      }
    `;
    const transformed = injectLoopGuards(code, 50);
    const fn = new Function(`${transformed}; return infiniteFor;`)();
    expect(() => fn()).toThrowError(/Execution timed out after 50ms \(infinite loop detected\)/);
  });

  it('allows normal finite loops to complete successfully without throwing', () => {
    const code = `
      function sumUpTo(n) {
        let total = 0;
        for (let i = 1; i <= n; i++) {
          total += i;
        }
        return total;
      }
    `;
    const transformed = injectLoopGuards(code, 2000);
    const fn = new Function(`${transformed}; return sumUpTo;`)();
    expect(fn(100)).toBe(5050);
  });

  it('handles single-statement non-block loops correctly', () => {
    const code = `
      function singleStmt() {
        let count = 0;
        while (count < 10) count++;
        return count;
      }
    `;
    const transformed = injectLoopGuards(code, 2000);
    const fn = new Function(`${transformed}; return singleStmt;`)();
    expect(fn()).toBe(10);
  });
});
