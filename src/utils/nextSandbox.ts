import React from 'react';

/**
 * Zero-dependency in-browser and Web Worker runtime shims for Next.js App Router globals.
 * Injected into the runner evaluation scope so learners can write standard Next.js code
 * without needing 'next/server', 'next/navigation', 'next/link', or 'next/image' external bundles.
 */

export interface CookieItem {
  name: string;
  value: string;
}

export class NextRequestCookies {
  private store: Map<string, string>;

  constructor(initialCookies: Record<string, string> | string = {}) {
    this.store = new Map();
    if (typeof initialCookies === 'string') {
      // Parse 'name=val; name2=val2' cookie header string
      const pairs = initialCookies.split(';');
      for (const pair of pairs) {
        const [k, v] = pair.split('=').map((s) => s.trim());
        if (k) this.store.set(k, v || '');
      }
    } else if (initialCookies && typeof initialCookies === 'object') {
      for (const [k, v] of Object.entries(initialCookies)) {
        this.store.set(k, String(v));
      }
    }
  }

  get(name: string): CookieItem | undefined {
    const val = this.store.get(name);
    return val !== undefined ? { name, value: val } : undefined;
  }

  getAll(): CookieItem[] {
    return Array.from(this.store.entries()).map(([name, value]) => ({ name, value }));
  }

  has(name: string): boolean {
    return this.store.has(name);
  }

  set(name: string, value: string): this {
    this.store.set(name, value);
    return this;
  }

  delete(name: string): boolean {
    return this.store.delete(name);
  }
}

export class NextRequest extends Request {
  public nextUrl: URL;
  public cookies: NextRequestCookies;
  public ip?: string;
  public geo?: { city?: string; country?: string; region?: string };

  constructor(input: RequestInfo | URL, init?: RequestInit & { cookies?: Record<string, string>; nextUrl?: URL }) {
    let rawCookie = '';
    if (init?.headers) {
      if (typeof (init.headers as Headers).get === 'function') {
        rawCookie = (init.headers as Headers).get('cookie') || (init.headers as Headers).get('Cookie') || '';
      } else if (Array.isArray(init.headers)) {
        for (const [k, v] of init.headers) {
          if (typeof k === 'string' && k.toLowerCase() === 'cookie') {
            rawCookie = String(v);
            break;
          }
        }
      } else if (typeof init.headers === 'object') {
        for (const [k, v] of Object.entries(init.headers)) {
          if (k.toLowerCase() === 'cookie') {
            rawCookie = String(v);
            break;
          }
        }
      }
    }

    super(input, init);
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    this.nextUrl = init?.nextUrl || new URL(urlStr, 'http://localhost:3000');

    if (!rawCookie) {
      try {
        rawCookie = this.headers.get('cookie') || '';
      } catch {
        rawCookie = '';
      }
    }

    if (rawCookie) {
      const origGet = this.headers.get.bind(this.headers);
      this.headers.get = (name: string) => {
        if (name.toLowerCase() === 'cookie') {
          return rawCookie;
        }
        return origGet(name);
      };
    }

    this.cookies = new NextRequestCookies(init?.cookies || rawCookie);
  }
}

export class NextResponse extends Response {
  public _rewriteUrl?: string;
  public _isNext?: boolean;
  public cookies: NextRequestCookies;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
    this.cookies = new NextRequestCookies();
  }

  static json<T = unknown>(data: T, init?: ResponseInit): NextResponse {
    const body = JSON.stringify(data);
    const headers = new Headers(init?.headers);
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    const res = new NextResponse(body, { ...init, headers });
    return res;
  }

  static redirect(url: string | URL, initOrStatus: number | ResponseInit = 307): NextResponse {
    const status = typeof initOrStatus === 'number' ? initOrStatus : initOrStatus?.status || 307;
    const dest = typeof url === 'string' ? url : url.toString();
    const headers = new Headers(typeof initOrStatus === 'object' ? initOrStatus.headers : undefined);
    headers.set('location', dest);
    return new NextResponse(null, { status, headers });
  }

  static rewrite(destination: string | URL, init?: ResponseInit): NextResponse {
    const res = new NextResponse(null, init);
    res._rewriteUrl = typeof destination === 'string' ? destination : destination.toString();
    return res;
  }

  static next(init?: ResponseInit & { request?: { headers?: Headers } }): NextResponse {
    const res = new NextResponse(null, init);
    res._isNext = true;
    return res;
  }
}

export interface RevalidationStore {
  tags: Set<string>;
  paths: Set<string>;
}

export const activeRevalidationStore: RevalidationStore = {
  tags: new Set<string>(),
  paths: new Set<string>(),
};

export function revalidateTag(tag: string): void {
  activeRevalidationStore.tags.add(tag);
}

export function revalidatePath(path: string): void {
  activeRevalidationStore.paths.add(path);
}

export function resetRevalidationStore(): void {
  activeRevalidationStore.tags.clear();
  activeRevalidationStore.paths.clear();
}

// ---------------------------------------------------------------------------
// Navigation and Routing Hooks (next/navigation)
// ---------------------------------------------------------------------------

let currentPathname = '/';

export function setMockPathname(pathname: string): void {
  currentPathname = pathname;
}

export function usePathname(): string {
  return currentPathname;
}

export interface MockRouter {
  push: (href: string) => void;
  replace: (href: string) => void;
  refresh: () => void;
  back: () => void;
  forward: () => void;
  prefetch: (href: string) => void;
  lastNavigated?: string;
  history: string[];
}

export const activeRouter: MockRouter = {
  history: [],
  push(href: string) {
    this.lastNavigated = href;
    this.history.push(href);
    currentPathname = href.split('?')[0];
  },
  replace(href: string) {
    this.lastNavigated = href;
    if (this.history.length > 0) this.history[this.history.length - 1] = href;
    else this.history.push(href);
    currentPathname = href.split('?')[0];
  },
  refresh() {},
  back() {},
  forward() {},
  prefetch() {},
};

export function useRouter(): MockRouter {
  return activeRouter;
}

export function setMockRouter(router: Partial<MockRouter>): void {
  Object.assign(activeRouter, router);
}

export function resetMockRouter(): void {
  activeRouter.history = [];
  delete activeRouter.lastNavigated;
  currentPathname = '/';
}

let currentSearchParams = new URLSearchParams();

export function setMockSearchParams(params: string | URLSearchParams | Record<string, string>): void {
  if (params instanceof URLSearchParams) {
    currentSearchParams = params;
  } else if (typeof params === 'string') {
    currentSearchParams = new URLSearchParams(params.startsWith('?') ? params.slice(1) : params);
  } else {
    currentSearchParams = new URLSearchParams(params);
  }
}

export function useSearchParams(): URLSearchParams {
  return currentSearchParams;
}

export class NextRedirectError extends Error {
  public url: string;
  constructor(url: string) {
    super(`NEXT_REDIRECT: ${url}`);
    this.name = 'NextRedirectError';
    this.url = url;
  }
}

export class NextNotFoundError extends Error {
  constructor() {
    super('NEXT_NOT_FOUND');
    this.name = 'NextNotFoundError';
  }
}

export function redirect(url: string): never {
  throw new NextRedirectError(url);
}

export function notFound(): never {
  throw new NextNotFoundError();
}

// ---------------------------------------------------------------------------
// Managed Next.js Primitives: <Link>, <Image>, <Script>, next/font
// ---------------------------------------------------------------------------

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string | { pathname?: string; query?: Record<string, unknown> };
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
  children?: React.ReactNode;
}

export function Link({ href, prefetch, scroll, children, className, ...rest }: LinkProps) {
  const url = typeof href === 'object' ? href.pathname || '/' : href;
  return React.createElement(
    'a',
    {
      href: url,
      className,
      'data-next-link': 'true',
      ...(prefetch !== undefined ? { 'data-prefetch': String(prefetch) } : {}),
      ...(scroll !== undefined ? { 'data-scroll': String(scroll) } : {}),
      ...rest,
    },
    children
  );
}

export interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function Image({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  sizes,
  className,
  ...rest
}: NextImageProps) {
  const imgProps: Record<string, unknown> = {
    src,
    alt,
    'data-next-image': 'true',
    decoding: 'async',
    loading: priority ? 'eager' : 'lazy',
    ...(priority ? { fetchPriority: 'high' } : {}),
    ...rest,
  };

  if (fill) {
    imgProps['data-fill'] = 'true';
    imgProps.className = ['object-cover', className].filter(Boolean).join(' ');
  } else {
    if (width !== undefined) imgProps.width = width;
    if (height !== undefined) imgProps.height = height;
    if (className) imgProps.className = className;
  }

  if (sizes) imgProps.sizes = sizes;

  return React.createElement('img', imgProps);
}

export interface NextScriptProps extends React.ScriptHTMLAttributes<HTMLScriptElement> {
  src?: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
  onLoad?: (e: unknown) => void;
  onError?: (e: unknown) => void;
  children?: string;
}

export function Script({
  src,
  strategy = 'afterInteractive',
  onLoad,
  children,
  ...rest
}: NextScriptProps) {
  React.useEffect(() => {
    if (onLoad) {
      const timer = setTimeout(() => onLoad({ type: 'load' }), 10);
      return () => clearTimeout(timer);
    }
  }, [onLoad]);

  return React.createElement('script', {
    src,
    'data-next-script': 'true',
    'data-strategy': strategy,
    ...rest,
  }, children);
}

export function Inter(options?: { subsets?: string[]; variable?: string }) {
  const variable = options?.variable || '--font-inter';
  return {
    className: '__className_inter',
    variable,
    style: { fontFamily: '__font_inter, sans-serif' },
  };
}

export interface UserBadgeProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    createdAt?: Date;
    [key: string]: unknown;
  };
}

export function UserBadge({ user }: UserBadgeProps): React.ReactElement {
  return React.createElement(
    'div',
    {
      'data-testid': 'user-badge',
      'data-has-password-hash': String('passwordHash' in (user || {})),
      'data-has-api-secret': String('apiSecret' in (user || {})),
    },
    user?.name ?? ''
  );
}

// ---------------------------------------------------------------------------
// Next.js 15 after() API (next/server)
// ---------------------------------------------------------------------------

export type AfterTask = (() => void | Promise<void>) | Promise<unknown>;
export const scheduledAfterTasks: AfterTask[] = [];

export function after(task: AfterTask): void {
  scheduledAfterTasks.push(task);
}

export async function flushAfterTasks(): Promise<void> {
  const tasks = [...scheduledAfterTasks];
  scheduledAfterTasks.length = 0;
  for (const task of tasks) {
    if (typeof task === 'function') {
      await task();
    } else if (task && typeof (task as Promise<unknown>).then === 'function') {
      await task;
    }
  }
}

export function resetAfterTasks(): void {
  scheduledAfterTasks.length = 0;
}


