interface HistoryRouteDef {
  name: string;
  path: string;
}

interface ResolvedHistoryRoute {
  name: string | null;
  params: Record<string, string>;
  path: string;
}

interface RouterWindow {
  location: { pathname: string };
  history: {
    pushState(state: unknown, title: string, url: string): void;
    replaceState(state: unknown, title: string, url: string): void;
  };
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

interface Router {
  current(): ResolvedHistoryRoute;
  navigate(path: string): void;
  replace(path: string): void;
  subscribe(fn: (route: ResolvedHistoryRoute) => void): () => boolean;
  destroy(): void;
}

function createRouter(routes: HistoryRouteDef[], win: RouterWindow = window): Router {
  const compiled = routes.map((r) => ({ name: r.name, parts: r.path.split('/').filter(Boolean) }));
  const subscribers = new Set<(route: ResolvedHistoryRoute) => void>();

  const resolve = (path: string): ResolvedHistoryRoute => {
    const segments = path.split('/').filter(Boolean);
    for (const { name, parts } of compiled) {
      if (parts.length !== segments.length) continue;
      const params: Record<string, string> = {};
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
  const notify = (): void => subscribers.forEach((fn) => fn(route));

  const onPopState = (): void => {
    route = resolve(win.location.pathname);
    notify();
  };
  win.addEventListener('popstate', onPopState);

  return {
    current: () => route,
    navigate(path: string): void {
      if (path === route.path) return;
      win.history.pushState(null, '', path);
      route = resolve(path);
      notify();
    },
    replace(path: string): void {
      win.history.replaceState(null, '', path);
      route = resolve(path);
      notify();
    },
    subscribe(fn: (route: ResolvedHistoryRoute) => void): () => boolean {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    destroy(): void {
      win.removeEventListener('popstate', onPopState);
      subscribers.clear();
    },
  };
}
