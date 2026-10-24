interface RouteDef {
  pattern: string;
  name: string;
}

interface ResolvedRoute {
  path: string;
  name: string | null;
  params: Record<string, string>;
  query: Record<string, string>;
}

interface Router {
  current(): ResolvedRoute;
  navigate(path: string): void;
  back(): void;
  forward(): void;
  subscribe(listener: (route: ResolvedRoute) => void): () => boolean;
}

function matchRoute(pattern: string, pathname: string): Record<string, string> | null {
  const split = (s: string): string[] => s.split('/').filter(Boolean);
  const patternParts = split(pattern);
  const parts = split(pathname);
  const params: Record<string, string> = {};
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

function createRouter(routes: RouteDef[], initialPath = '/'): Router {
  const history: string[] = [initialPath];
  let index = 0;
  const listeners = new Set<(route: ResolvedRoute) => void>();

  const resolve = (fullPath: string): ResolvedRoute => {
    const [path, search = ''] = fullPath.split('?');
    const query = Object.fromEntries(new URLSearchParams(search));
    for (const route of routes) {
      const params = matchRoute(route.pattern, path);
      if (params) return { path, name: route.name, params, query };
    }
    return { path, name: null, params: {}, query };
  };

  const notify = (): void => {
    const state = resolve(history[index]);
    listeners.forEach((fn) => fn(state));
  };

  return {
    current: () => resolve(history[index]),
    navigate(path: string): void {
      history.splice(index + 1);
      history.push(path);
      index = history.length - 1;
      notify();
    },
    back(): void {
      if (index === 0) return;
      index--;
      notify();
    },
    forward(): void {
      if (index >= history.length - 1) return;
      index++;
      notify();
    },
    subscribe(listener: (route: ResolvedRoute) => void): () => boolean {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
