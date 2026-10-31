class RadixRouter {
  constructor() {
    this.trees = {};
  }

  _normalizePath(path) {
    if (!path.startsWith('/')) path = `/${path}`;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  }

  add(method, path, handler) {
    const m = method.toUpperCase();
    if (!this.trees[m]) {
      this.trees[m] = { static: {}, param: null, wildcard: null, handler: null };
    }

    const norm = this._normalizePath(path);
    const segments = norm === '/' ? [] : norm.slice(1).split('/');
    let node = this.trees[m];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.startsWith('*')) {
        node.wildcard = { paramName: seg.slice(1) || '*', handler };
        return;
      }
      if (seg.startsWith(':')) {
        const paramName = seg.slice(1);
        if (!node.param) {
          node.param = { name: paramName, node: { static: {}, param: null, wildcard: null, handler: null } };
        }
        node = node.param.node;
      } else {
        if (!node.static[seg]) {
          node.static[seg] = { static: {}, param: null, wildcard: null, handler: null };
        }
        node = node.static[seg];
      }
    }
    node.handler = handler;
  }

  find(method, path) {
    const root = this.trees[method.toUpperCase()];
    if (!root) return null;

    const norm = this._normalizePath(path);
    const segments = norm === '/' ? [] : norm.slice(1).split('/');
    const params = {};

    function matchNode(node, idx) {
      if (idx === segments.length) {
        if (node.handler) {
          return { handler: node.handler, params: { ...params } };
        }
        if (node.wildcard) {
          params[node.wildcard.paramName] = '';
          return { handler: node.wildcard.handler, params: { ...params } };
        }
        return null;
      }

      const seg = segments[idx];

      // 1. Static match
      if (node.static[seg]) {
        const res = matchNode(node.static[seg], idx + 1);
        if (res) return res;
      }

      // 2. Param match
      if (node.param) {
        params[node.param.name] = seg;
        const res = matchNode(node.param.node, idx + 1);
        if (res) return res;
        delete params[node.param.name];
      }

      // 3. Wildcard match
      if (node.wildcard) {
        params[node.wildcard.paramName] = segments.slice(idx).join('/');
        return { handler: node.wildcard.handler, params: { ...params } };
      }

      return null;
    }

    return matchNode(root, 0);
  }
}
