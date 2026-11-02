interface QuadPoint {
  x: number;
  y: number;
  id?: string | number;
  [key: string]: any;
}

interface QuadtreeIndexInstance {
  tree: any;
  size: () => number;
  extent: () => [[number, number], [number, number]];
  add: (point: QuadPoint) => QuadtreeIndexInstance;
  addAll: (points: QuadPoint[]) => QuadtreeIndexInstance;
  findNearest: (x: number, y: number, radius?: number) => QuadPoint | null;
  findPointsInRadius: (x: number, y: number, radius: number) => QuadPoint[];
}

function createQuadtreeIndex(points: QuadPoint[] = []): QuadtreeIndexInstance {
  const tree = d3
    .quadtree()
    .x((d: QuadPoint) => d.x)
    .y((d: QuadPoint) => d.y);

  if (Array.isArray(points) && points.length > 0) {
    tree.addAll(points);
  }

  const instance: QuadtreeIndexInstance = {
    tree,
    size: () => tree.size(),
    extent: () => tree.extent(),
    add: (point: QuadPoint) => {
      tree.add(point);
      return instance;
    },
    addAll: (pts: QuadPoint[]) => {
      tree.addAll(pts);
      return instance;
    },
    findNearest: (x: number, y: number, radius?: number): QuadPoint | null => {
      if (typeof radius === 'number') {
        return tree.find(x, y, radius) ?? null;
      }
      return tree.find(x, y) ?? null;
    },
    findPointsInRadius: (x: number, y: number, radius: number): QuadPoint[] => {
      const results: QuadPoint[] = [];
      const rx0 = x - radius;
      const ry0 = y - radius;
      const rx1 = x + radius;
      const ry1 = y + radius;
      const rSquared = radius * radius;

      tree.visit((node: any, x0: number, y0: number, x1: number, y1: number): boolean => {
        if (x1 < rx0 || x0 > rx1 || y1 < ry0 || y0 > ry1) {
          return true;
        }

        if (!node.length) {
          let curr = node;
          do {
            const p = curr.data as QuadPoint;
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
