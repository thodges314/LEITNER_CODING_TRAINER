function createRouter(routes, win = window) {
  const compiled = routes.map((r) => ({ name: r.name, parts: r.path.split('/').filter(Boolean) }));
  const subscribers = new Set();

  const resolve = (path) => {
    const segments = path.split('/').filter(Boolean);
    for (const { name, parts } of compiled) {
      if (parts.length !== segments.length) continue;
      const params = {};
      const matches = parts.every((part, i) => {
        if (part.startsWith(':')) {
          params[part.slice(1)] = decodeURIComponent(segments[i]);
          return true;
        }
        return part === segments[i];
      });
      if (matches) return { name, params, path };
    }
    return { name: null, params: {}, path };
  };

  let route = resolve(win.location.pathname);
  const notify = () => subscribers.forEach((fn) => fn(route));

  const onPopState = () => {
    route = resolve(win.location.pathname);
    notify();
  };
  win.addEventListener('popstate', onPopState);

  return {
    current: () => route,
    navigate(path) {
      if (path === route.path) return;
      win.history.pushState(null, '', path);
      route = resolve(path);
      notify();
    },
    replace(path) {
      win.history.replaceState(null, '', path);
      route = resolve(path);
      notify();
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    destroy() {
      win.removeEventListener('popstate', onPopState);
      subscribers.clear();
    },
  };
}
