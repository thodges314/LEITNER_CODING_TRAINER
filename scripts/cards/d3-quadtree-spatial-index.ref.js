function createQuadtreeIndex(points = []) {
  const tree = d3
    .quadtree()
    .x((d) => d.x)
    .y((d) => d.y);

  if (Array.isArray(points) && points.length > 0) {
    tree.addAll(points);
  }

  const instance = {
    tree,
    size: () => tree.size(),
    extent: () => tree.extent(),
    add: (point) => {
      tree.add(point);
      return instance;
    },
    addAll: (pts) => {
      tree.addAll(pts);
      return instance;
    },
    findNearest: (x, y, radius) => {
      if (typeof radius === 'number') {
        return tree.find(x, y, radius) ?? null;
      }
      return tree.find(x, y) ?? null;
    },
    findPointsInRadius: (x, y, radius) => {
      const results = [];
      const rx0 = x - radius;
      const ry0 = y - radius;
      const rx1 = x + radius;
      const ry1 = y + radius;
      const rSquared = radius * radius;

      tree.visit((node, x0, y0, x1, y1) => {
        if (x1 < rx0 || x0 > rx1 || y1 < ry0 || y0 > ry1) {
          return true;
        }

        if (!node.length) {
          let curr = node;
          do {
            const p = curr.data;
            if (p) {
              const dx = p.x - x;
              const dy = p.y - y;
              if (dx * dx + dy * dy <= rSquared) {
                results.push(p);
              }
            }
          } while ((curr = curr.next));
        }

        return false;
      });

      return results;
    },
  };

  return instance;
}
