/**
 * Zero-dependency in-browser and Web Worker runtime shims for Next.js App Router globals.
 * Injected into the runner evaluation scope so learners can write standard Next.js code
 * without needing 'next/server' or 'next/navigation' bundled dependencies.
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
    super(input, init);
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    this.nextUrl = init?.nextUrl || new URL(urlStr, 'http://localhost:3000');
    const cookieHeader = this.headers.get('cookie') || '';
    this.cookies = new NextRequestCookies(init?.cookies || cookieHeader);
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
