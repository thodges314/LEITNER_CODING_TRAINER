const SAMPLE_TREE_DATA = [
  { id: 'flare', parentId: null },
  { id: 'analytics', parentId: 'flare' },
  { id: 'cluster', parentId: 'analytics', value: 3838 },
  { id: 'graph', parentId: 'analytics', value: 7000 },
  { id: 'animate', parentId: 'flare', value: 1000 },
];

// 1. Builds validated hierarchy tree and aggregates total root value
{
  const result = stratifyHierarchy(SAMPLE_TREE_DATA);

  const passed =
    result !== null &&
    result.rootId === 'flare' &&
    result.totalValue === 11838 &&
    result.maxDepth === 2 &&
    typeof result.root === 'object';

  $test.check(
    'Builds validated hierarchy tree and aggregates total root value',
    passed,
    `Expected rootId "flare", totalValue 11838, maxDepth 2; got rootId="${result?.rootId}", totalValue=${result?.totalValue}, maxDepth=${result?.maxDepth}`
  );
}

// 2. Extracts leaves with correct parentId, depth, height, and values
{
  const result = stratifyHierarchy(SAMPLE_TREE_DATA);
  const leaves = result.leaves;

  const cluster = leaves.find((l) => l.id === 'cluster');
  const graph = leaves.find((l) => l.id === 'graph');
  const animate = leaves.find((l) => l.id === 'animate');

  const passed =
    leaves.length === 3 &&
    cluster !== undefined &&
    cluster.parentId === 'analytics' &&
    cluster.depth === 2 &&
    cluster.height === 0 &&
    cluster.value === 3838 &&
    graph !== undefined &&
    graph.value === 7000 &&
    animate !== undefined &&
    animate.depth === 1 &&
    animate.value === 1000;

  $test.check(
    'Extracts leaves with correct parentId, depth, height, and values',
    passed,
    `Expected 3 leaves with valid depths, heights, and values; got ${JSON.stringify(leaves)}`
  );
}

// 3. Traverses ancestors from leaf node up to root
{
  const result = stratifyHierarchy(SAMPLE_TREE_DATA);
  const clusterAncestors = result.ancestorsOf('cluster');
  const missingAncestors = result.ancestorsOf('unknown-node');

  const passed =
    Array.isArray(clusterAncestors) &&
    clusterAncestors.length === 3 &&
    clusterAncestors[0] === 'cluster' &&
    clusterAncestors[1] === 'analytics' &&
    clusterAncestors[2] === 'flare' &&
    Array.isArray(missingAncestors) &&
    missingAncestors.length === 0;

  $test.check(
    'Traverses ancestors from leaf node up to root',
    passed,
    `Expected ["cluster", "analytics", "flare"] and []; got ${JSON.stringify(clusterAncestors)} and ${JSON.stringify(missingAncestors)}`
  );
}

// 4. Collects subtree descendants from branch node
{
  const result = stratifyHierarchy(SAMPLE_TREE_DATA);
  const analyticsDescendants = result.descendantsOf('analytics');
  const analyticsNode = result.getNode('analytics');
  const unknownNode = result.getNode('non-existent');

  const passed =
    Array.isArray(analyticsDescendants) &&
    analyticsDescendants.includes('analytics') &&
    analyticsDescendants.includes('cluster') &&
    analyticsDescendants.includes('graph') &&
    analyticsDescendants.length === 3 &&
    analyticsNode !== null &&
    analyticsNode.id === 'analytics' &&
    analyticsNode.parentId === 'flare' &&
    analyticsNode.depth === 1 &&
    analyticsNode.height === 1 &&
    analyticsNode.value === 10838 &&
    unknownNode === null;

  $test.check(
    'Collects subtree descendants from branch node',
    passed,
    `Expected analytics subtree with 3 descendants and node metric value 10838; got descendants=${JSON.stringify(analyticsDescendants)}, node=${JSON.stringify(analyticsNode)}`
  );
}

// 5. Applies custom valueAccessor option
{
  const customData = [
    { id: 'corp', parentId: null },
    { id: 'eng', parentId: 'corp', headcount: 40 },
    { id: 'sales', parentId: 'corp', headcount: 25 },
  ];

  const result = stratifyHierarchy(customData, {
    valueAccessor: (d) => (d.headcount || 0) * 10,
  });

  const passed =
    result.totalValue === 650 &&
    result.leaves.length === 2 &&
    result.leaves.find((l) => l.id === 'eng')?.value === 400 &&
    result.leaves.find((l) => l.id === 'sales')?.value === 250;

  $test.check(
    'Applies custom valueAccessor option',
    passed,
    `Expected totalValue 650 with custom multiplier; got ${result.totalValue}`
  );
}

// 6. Validates inputs and handles single root edge case
{
  let threwOnEmpty = false;
  try {
    stratifyHierarchy([]);
  } catch {
    threwOnEmpty = true;
  }

  const single = stratifyHierarchy([{ id: 'solo', parentId: null, value: 99 }]);

  const passed =
    threwOnEmpty &&
    single.rootId === 'solo' &&
    single.totalValue === 99 &&
    single.maxDepth === 0 &&
    single.leaves.length === 1 &&
    single.leaves[0].id === 'solo' &&
    single.leaves[0].depth === 0;

  $test.check(
    'Validates inputs and handles single root edge case',
    passed,
    `Expected empty array to throw and single node to return root with maxDepth 0; threw=${threwOnEmpty}, single=${JSON.stringify(single)}`
  );
}
