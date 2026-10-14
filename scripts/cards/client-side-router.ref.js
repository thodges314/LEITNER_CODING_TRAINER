function matchRoute(pattern, pathname) {
  const split = (s) => s.split('/').filter(Boolean);
  const patternParts = split(pattern);
  const parts = split(pathname);
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    if (p === '*') {
      params['*'] = parts.slice(i).map(decodeURIComponent).join('/');
      return params;
    }
    if (i >= parts.length) return null;
    if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(parts[i]);
    else if (p !== parts[i]) return null;
  }
  return patternParts.length === parts.length ? params : null;
}

function createRouter(routes, initialPath = '/') {
  const history = [initialPath];
  let index = 0;
  const listeners = new Set();

  const resolve = (fullPath) => {
    const [path, search = ''] = fullPath.split('?');
    const query = Object.fromEntries(new URLSearchParams(search));
    for (const route of routes) {
      const params = matchRoute(route.pattern, path);
      if (params) return { path, name: route.name, params, query };
    }
    return { path, name: null, params: {}, query };
  };

  const notify = () => {
    const state = resolve(history[index]);
    listeners.forEach((fn) => fn(state));
  };

  return {
    current: () => resolve(history[index]),
    navigate(path) {
      history.splice(index + 1); // drop forward entries
      history.push(path);
      index = history.length - 1;
      notify();
    },
    back() {
      if (index === 0) return;
      index--;
      notify();
    },
    forward() {
      if (index >= history.length - 1) return;
      index++;
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
