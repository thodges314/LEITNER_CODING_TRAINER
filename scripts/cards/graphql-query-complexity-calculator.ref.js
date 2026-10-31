function calculateQueryComplexity(nodes, config = {}) {
  const defaultCost = typeof config.defaultCost === 'number' ? config.defaultCost : 1;
  const fieldCosts = config.fieldCosts || {};

  function computeNodesCost(list) {
    if (!Array.isArray(list) || list.length === 0) return 0;

    let sum = 0;
    for (const node of list) {
      if (!node || typeof node !== 'object') continue;

      const baseCost = typeof fieldCosts[node.name] === 'number' ? fieldCosts[node.name] : defaultCost;

      let multiplier = 1;
      const first = node.args?.first;
      const limit = node.args?.limit;
      if (typeof first === 'number' && first > 0) {
        multiplier = first;
      } else if (typeof limit === 'number' && limit > 0) {
        multiplier = limit;
      }

      const childCost = Array.isArray(node.fields) && node.fields.length > 0 ? computeNodesCost(node.fields) : 0;
      sum += baseCost + multiplier * childCost;
    }
    return sum;
  }

  const complexity = computeNodesCost(nodes);
  const maxComplexity = config.maxComplexity;
  const exceeded = typeof maxComplexity === 'number' && maxComplexity > 0 ? complexity > maxComplexity : false;

  return { complexity, exceeded };
}
