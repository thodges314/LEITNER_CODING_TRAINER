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

  it('validates extended SVG, Canvas, and DOM event ambient types', () => {
    const code = `
      function inspectDom(
        svg: SVGSVGElement,
        group: SVGGElement,
        path: SVGPathElement,
        rect: SVGRectElement,
        circle: SVGCircleElement,
        canvas: HTMLCanvasElement,
        dialog: HTMLDialogElement,
        ptr: PointerEvent,
        wheel: WheelEvent,
        bounds: DOMRect,
        list: NodeListOf<HTMLDivElement>
      ): number {
        const ctx = canvas.getContext('2d');
        if (ctx && !dialog.open) dialog.showModal();
        return bounds.width + bounds.height + list.length + (ptr ? 0 : 1) + (wheel ? 0 : 1);
      }
    `;
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('validates idiomatic generic D3 APIs and type inference without errors', () => {
    const code = `
      interface Row { id: string; parentId: string | null; value: number; }
      interface Pt { x: number; y: number; }

      function testD3(rows: Row[], pts: Pt[], container: HTMLElement): number {
        const root: d3.HierarchyNode<Row> = d3
          .stratify<Row>()
          .id((d) => d.id)
          .parentId((d) => d.parentId)(rows)
          .sum((d) => d.value);

        const tree: d3.Quadtree<Pt> = d3
          .quadtree<Pt>()
          .x((d) => d.x)
          .y((d) => d.y)
          .addAll(pts);
        const nearest: Pt | undefined = tree.find(10, 20, 50);

        const pieGen = d3.pie<Row>().value((d) => d.value);
        const arcs: d3.PieArcDatum<Row>[] = pieGen(rows);

        const xScale = d3.scaleLinear().domain([0, 100]).range([0, 400]);
        const lineGen = d3.line<Pt>().x((d) => xScale(d.x)).y((d) => xScale(d.y));
        const pathData: string | null = lineGen(pts);

        const delaunay = d3.Delaunay.from(pts, (d) => d.x, (d) => d.y);
        const voronoi = delaunay.voronoi([0, 0, 400, 300]);
        const cellPath: string = voronoi.renderCell(0);

        d3.select(container).append('svg').attr('d', pathData ?? cellPath);
        return (root.value ?? 0) + arcs.length + (nearest ? nearest.x : 0);
      }
    `;
    const result = checkAndTranspileTS(code);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('retrieves hover QuickInfo for ambient d3 methods', () => {
    const code = 'const scale = d3.scaleLinear().domain([0, 10]);';
    const pos = code.indexOf('scaleLinear');
    const info = getTSQuickInfo(code, pos);
    expect(info).not.toBeNull();
    expect(info?.signature).toContain('scaleLinear');
  });

  it('injects D3 card domain interfaces per-card from the active card prompt without requiring local declaration', () => {
    const promptSeed = [
      '```ts',
      'interface VoronoiPoint { x: number; y: number; id?: string | number; label?: string; }',
      'interface VoronoiSnappingOptions { width?: number; height?: number; }',
      'interface TreemapNodeData { name: string; value?: number; children?: TreemapNodeData[]; }',
      'interface TreemapOptions { width?: number; height?: number; }',
      'interface QuadPoint { x: number; y: number; id?: string | number; }',
      'interface HierarchyRecord { id: string; parentId: string | null; value?: number; }',
      '```',
    ].join('\n');

    const code = `
      function testCardInterfaces(
        pts: VoronoiPoint[],
        voronoiOpts: VoronoiSnappingOptions,
        treeData: TreemapNodeData,
        treemapOpts: TreemapOptions,
        quadPts: QuadPoint[],
        rows: HierarchyRecord[]
      ): number {
        const delaunay = d3.Delaunay.from(pts, (p) => p.x, (p) => p.y);
        const root = d3.hierarchy(treeData).sum((d) => d.value || 0);
        const qt = d3.quadtree<QuadPoint>().x((d) => d.x).y((d) => d.y).addAll(quadPts);
        return delaunay.points.length + (root.value ?? 0) + qt.size() + rows.length + (voronoiOpts.width ?? 0) + (treemapOpts.height ?? 0);
      }
    `;
    const result = checkAndTranspileTS(code, promptSeed);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('dynamically injects a card prompt ts interface block so non-D3 cards do not require retyping interfaces', () => {
    const promptSeed = [
      '```ts',
      'export interface KanbanCard {',
      '  id: string;',
      '  title: string;',
      '  description?: string;',
      '}',
      'export interface KanbanColumn {',
      '  id: string;',
      '  title: string;',
      '  cards: KanbanCard[];',
      '}',
      'export interface KanbanBoardProps {',
      '  initialColumns: KanbanColumn[];',
      '}',
      '```',
    ].join('\n');

    const code = `
      function KanbanBoard({ initialColumns }: KanbanBoardProps) {
        const firstCard: KanbanCard | undefined = initialColumns[0]?.cards[0];
        return <div>{firstCard ? firstCard.title : 'Empty'}</div>;
      }
    `;
    const result = checkAndTranspileTS(code, promptSeed);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toHaveLength(0);

    // Also compiles cleanly if the solution file (.ref.ts) includes the interfaces/types itself
    const codeWithTypes = `${promptSeed.replace(/```ts|```/g, '').trim()}\n${code}`;
    const resultWithTypes = checkAndTranspileTS(codeWithTypes, promptSeed);
    expect(resultWithTypes.success).toBe(true);
    expect(resultWithTypes.diagnostics).toHaveLength(0);
  });
});
