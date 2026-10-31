class RadixRouter {
  trees: Record<string, any> = {};

  #norm(p: string): string[] {
    return p.replace(/\/+$/, '').split('/').filter(Boolean);
  }

  add(method: string, path: string, handler: (...args: any[]) => any): void {
    let node = (this.trees[method.toUpperCase()] ??= { static: {}, param: null, wildcard: null });
    for (const seg of this.#norm(path)) {
      if (seg.startsWith('*')) {
        node.wildcard = { name: seg.slice(1) || '*', handler };
        return;
      }
      if (seg.startsWith(':')) {
        node = (node.param ??= { name: seg.slice(1), node: { static: {}, param: null, wildcard: null } }).node;
      } else {
        node = (node.static[seg] ??= { static: {}, param: null, wildcard: null });
      }
    }
    node.handler = handler;
  }

  find(method: string, path: string): RouteMatch | null {
    const root = this.trees[method.toUpperCase()];
    if (!root) return null;
    const segs = this.#norm(path), params: Record<string, string> = {};

    const search = (node: any, i: number): RouteMatch | null => {
      if (i === segs.length) {
        if (node.handler) return { handler: node.handler, params: { ...params } };
        if (node.wildcard) return { handler: node.wildcard.handler, params: { ...params, [node.wildcard.name]: '' } };
        return null;
      }
      const s = segs[i];
      if (node.static[s]) {
        const res = search(node.static[s], i + 1);
        if (res) return res;
      }
      if (node.param) {
        params[node.param.name] = s;
        const res = search(node.param.node, i + 1);
        if (res) return res;
        delete params[node.param.name];
      }
      if (node.wildcard) {
        return { handler: node.wildcard.handler, params: { ...params, [node.wildcard.name]: segs.slice(i).join('/') } };
      }
      return null;
    };

    return search(root, 0);
  }
}
