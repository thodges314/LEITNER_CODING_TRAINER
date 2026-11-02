interface HierarchyRecord {
  id: string;
  parentId: string | null;
  value?: number;
  [key: string]: any;
}

interface HierarchyNodeMetric {
  id: string;
  parentId: string | null;
  depth: number;
  height: number;
  value: number;
}

interface StratifyOptions {
  /** Custom numeric value accessor, defaults to d => Number(d.value) || 0 */
  valueAccessor?: (d: HierarchyRecord) => number;
}

interface StratifyResult {
  root: any;
  rootId: string;
  totalValue: number;
  maxDepth: number;
  leaves: HierarchyNodeMetric[];
  ancestorsOf: (id: string) => string[];
  descendantsOf: (id: string) => string[];
  getNode: (id: string) => HierarchyNodeMetric | null;
}

function stratifyHierarchy(
  data: HierarchyRecord[],
  options?: StratifyOptions
): StratifyResult {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input data must be a non-empty array of records');
  }

  const stratify = d3
    .stratify()
    .id((d: HierarchyRecord) => d.id)
    .parentId((d: HierarchyRecord) => (d.parentId === '' ? null : d.parentId));

  const root = stratify(data);

  const valueAccessor =
    options?.valueAccessor || ((d: HierarchyRecord) => Number(d.value) || 0);

  root.sum(valueAccessor);

  const toMetric = (node: any): HierarchyNodeMetric => ({
    id: node.id ?? '',
    parentId: node.data?.parentId ?? null,
    depth: node.depth,
    height: node.height,
    value: node.value ?? 0,
  });

  const leaves: HierarchyNodeMetric[] = root.leaves().map(toMetric);

  const nodeMap = new Map<string, any>();
  for (const node of root.descendants()) {
    if (node.id) {
      nodeMap.set(node.id, node);
    }
  }

  const ancestorsOf = (id: string): string[] => {
    const node = nodeMap.get(id);
    if (!node) return [];
    return node.ancestors().map((n: any) => n.id ?? '');
  };

  const descendantsOf = (id: string): string[] => {
    const node = nodeMap.get(id);
    if (!node) return [];
    return node.descendants().map((n: any) => n.id ?? '');
  };

  const getNode = (id: string): HierarchyNodeMetric | null => {
    const node = nodeMap.get(id);
    if (!node) return null;
    return toMetric(node);
  };

  return {
    root,
    rootId: root.id ?? '',
    totalValue: root.value ?? 0,
    maxDepth: root.height,
    leaves,
    ancestorsOf,
    descendantsOf,
    getNode,
  };
}