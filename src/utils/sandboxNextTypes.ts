/**
 * Ambient Next.js App Router types for the in-browser TypeScript sandbox.
 * Appended to sandbox globals so learners have full autocomplete and zero noImplicitAny
 * errors for Next.js App Router constructs.
 */

export const SANDBOX_NEXT_TYPES = `
  interface Headers {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callbackfn: (value: string, key: string, parent: Headers) => void): void;
    [key: string]: any;
  }
  declare var Headers: {
    prototype: Headers;
    new (init?: any): Headers;
  };

  interface RequestInit {
    method?: string;
    headers?: any;
    body?: any;
    mode?: any;
    credentials?: any;
    cache?: any;
    redirect?: any;
    referrer?: any;
    integrity?: any;
    [key: string]: any;
  }

  interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: any;
    [key: string]: any;
  }

  interface Request {
    readonly headers: Headers;
    readonly method: string;
    readonly url: string;
    json(): Promise<any>;
    text(): Promise<string>;
    formData(): Promise<FormData>;
    blob(): Promise<any>;
    arrayBuffer(): Promise<ArrayBuffer>;
    clone(): Request;
    [key: string]: any;
  }
  declare var Request: {
    prototype: Request;
    new (input: any, init?: RequestInit): Request;
  };

  interface Response {
    readonly headers: Headers;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly url: string;
    json(): Promise<any>;
    text(): Promise<string>;
    formData(): Promise<FormData>;
    blob(): Promise<any>;
    arrayBuffer(): Promise<ArrayBuffer>;
    clone(): Response;
    [key: string]: any;
  }
  declare var Response: {
    prototype: Response;
    new (body?: any, init?: ResponseInit): Response;
    json(data: any, init?: ResponseInit): Response;
  };

  interface FormData {
    append(name: string, value: any, fileName?: string): void;
    delete(name: string): void;
    get(name: string): any;
    getAll(name: string): any[];
    has(name: string): boolean;
    set(name: string, value: any, fileName?: string): void;
    forEach(callbackfn: (value: any, key: string, parent: FormData) => void): void;
    [key: string]: any;
  }
  declare var FormData: {
    prototype: FormData;
    new (): FormData;
  };

  declare namespace NextServer {
    interface CookieItem {
      name: string;
      value: string;
    }

    interface RequestCookies {
      get(name: string): CookieItem | undefined;
      getAll(): CookieItem[];
      has(name: string): boolean;
      set(name: string, value: string): this;
      delete(name: string): boolean;
    }

    class NextRequest extends Request {
      nextUrl: URL;
      cookies: RequestCookies;
      ip?: string;
      geo?: { city?: string; country?: string; region?: string };
      constructor(input: RequestInfo | URL, init?: RequestInit & { cookies?: Record<string, string>; nextUrl?: URL });
    }

    class NextResponse extends Response {
      cookies: RequestCookies;
      constructor(body?: BodyInit | null, init?: ResponseInit);
      static json<T = any>(data: T, init?: ResponseInit): NextResponse;
      static redirect(url: string | URL, initOrStatus?: number | ResponseInit): NextResponse;
      static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
      static next(init?: ResponseInit & { request?: { headers?: Headers } }): NextResponse;
    }
  }

  declare var NextRequest: typeof NextServer.NextRequest;
  declare type NextRequest = NextServer.NextRequest;
  declare var NextResponse: typeof NextServer.NextResponse;
  declare type NextResponse = NextServer.NextResponse;

  declare function revalidateTag(tag: string): void;
  declare function revalidatePath(path: string, type?: 'page' | 'layout'): void;

  declare module 'next/server' {
    export import NextRequest = NextServer.NextRequest;
    export import NextResponse = NextServer.NextResponse;
  }

  declare module 'next/cache' {
    export function revalidateTag(tag: string): void;
    export function revalidatePath(path: string, type?: 'page' | 'layout'): void;
  }

  declare module 'next/navigation' {
    export function redirect(url: string, type?: any): never;
    export function notFound(): never;
    export function useRouter(): {
      push(href: string): void;
      replace(href: string): void;
      refresh(): void;
      back(): void;
      forward(): void;
      prefetch(href: string): void;
    };
    export function usePathname(): string;
    export function useSearchParams(): URLSearchParams;
  }

  interface Metadata {
    title?: string | { default: string; template: string };
    description?: string;
    keywords?: string[];
    openGraph?: {
      title?: string;
      description?: string;
      url?: string;
      siteName?: string;
      images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      images?: string[];
    };
    alternates?: {
      canonical?: string;
    };
    robots?: string | { index?: boolean; follow?: boolean };
    [key: string]: any;
  }
`;

