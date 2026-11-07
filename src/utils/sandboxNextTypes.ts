/**
 * Ambient Next.js App Router types for the in-browser TypeScript sandbox.
 * Appended to sandbox globals so learners have full autocomplete and zero noImplicitAny
 * errors for Next.js App Router constructs.
 */

export const SANDBOX_NEXT_TYPES = `
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

