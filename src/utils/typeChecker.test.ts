import { describe, it, expect } from 'vitest';
import { checkAndTranspileTS, getTSQuickInfo } from './typeChecker';

describe('typeChecker & getTSQuickInfo', () => {
  it('validates and transpiles valid TypeScript', () => {
    const code = 'function add(a: number, b: number): number { return a + b; }';
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
    expect(result.code).toContain('function add(a, b)');
  });

  it('reports type diagnostics for invalid TypeScript', () => {
    const code = 'const x: number = "not a number";';
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(false);
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0].message).toContain('Type \'string\' is not assignable to type \'number\'');
  });

  it('retrieves hover QuickInfo for function parameters', () => {
    const code = 'function twoSum(nums: number[], target: number): [number, number] { return [0, 1]; }';
    const pos = code.indexOf('nums');
    const info = getTSQuickInfo(code, pos);

    expect(info).not.toBeNull();
    expect(info?.signature).toBe('(parameter) nums: number[]');
    expect(info?.start).toBe(pos);
    expect(info?.length).toBe(4);
  });

  it('retrieves hover QuickInfo for ambient ListNode', () => {
    const code = 'function reverseList(head: ListNode<number> | null): ListNode<number> | null { return head ? head.next : null; }';
    const pos = code.indexOf('next');
    const info = getTSQuickInfo(code, pos);

    expect(info).not.toBeNull();
    expect(info?.signature).toContain('ListNode<number>.next');
  });

  it('retrieves hover QuickInfo for ambient TreeNode', () => {
    const code = 'function invert(root: TreeNode<number> | null): TreeNode<number> | null { return root ? root.left : null; }';
    const pos = code.indexOf('left');
    const info = getTSQuickInfo(code, pos);

    expect(info).not.toBeNull();
    expect(info?.signature).toContain('TreeNode<number>.left');
  });

  it('retrieves hover QuickInfo for standard library methods', () => {
    const code = 'const nums = [1, 2, 3]; const doubled = nums.map(x => x * 2);';
    const pos = code.indexOf('map');
    const info = getTSQuickInfo(code, pos);

    expect(info).not.toBeNull();
    expect(info?.signature).toContain('Array<number>.map');
  });

  it('returns null for empty space or out-of-range positions', () => {
    const code = 'const x = 1;';
    expect(getTSQuickInfo(code, -1)).toBeNull();
    expect(getTSQuickInfo(code, 999)).toBeNull();
  });

  it('validates ambient DOM and browser globals without errors', () => {
    const code = `
      const u = new URLSearchParams("a=1");
      const w = window.location.pathname;
      const d = document.createElement("div");
      const store = localStorage.getItem("key");
      const frame = requestAnimationFrame(() => {});
      cancelAnimationFrame(frame);
      function handle(e: KeyboardEvent, el: HTMLElement, node: Node, evt: Event): void {}
    `;
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('validates React component and JSX without errors', () => {
    const code = `
      interface SearchFormProps {
        onSearch: (query: string) => void;
      }
      function SearchForm({ onSearch }: SearchFormProps) {
        const [query, setQuery] = useState('');
        return <form><input value={query} /><button type="submit">Search</button></form>;
      }
    `;
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('validates generic arrow functions without trailing comma in type parameters', () => {
    const code = 'const identity = <T>(value: T): T => value;';
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
    expect(result.code).toContain('const identity = (value) => value;');
  });

  it('reports type errors on generic arrow functions without trailing comma', () => {
    const code = 'const identity = <T>(value: T): T => 123;';
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(false);
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0].message).toContain("Type 'number' is not assignable to type 'T'");
  });

  it('retrieves hover QuickInfo on generic arrow function without trailing comma', () => {
    const code = 'const identity = <T>(value: T): T => value;';
    const pos = code.indexOf('identity');
    const info = getTSQuickInfo(code, pos);
    expect(info).not.toBeNull();
    expect(info?.signature).toBe('const identity: <T>(value: T) => T');
  });

  it('supports generic arrow functions without trailing comma in files containing JSX', () => {
    const code = `
      const identity = <T>(value: T): T => value;
      function App() {
        return <div>{identity("test")}</div>;
      }
    `;
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
  });
});
