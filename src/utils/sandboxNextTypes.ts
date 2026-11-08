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
  declare var activeRevalidationStore: { tags: Set<string>; paths: Set<string> };
  declare function resetRevalidationStore(): void;

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

  declare module 'next/link' {
    import * as React from 'react';
    export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
      href: string | { pathname?: string; query?: any };
      prefetch?: boolean;
      scroll?: boolean;
      replace?: boolean;
      children?: React.ReactNode;
      className?: string;
    }
    const Link: React.ComponentType<LinkProps>;
    export default Link;
  }

  declare module 'next/image' {
    import * as React from 'react';
    export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
      src: string | any;
      alt: string;
      width?: number;
      height?: number;
      fill?: boolean;
      priority?: boolean;
      sizes?: string;
      className?: string;
    }
    const Image: React.ComponentType<ImageProps>;
    export default Image;
  }

  declare module 'next/script' {
    import * as React from 'react';
    export interface ScriptProps extends React.ScriptHTMLAttributes<HTMLScriptElement> {
      src?: string;
      strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
      onLoad?: (e: any) => void;
      onError?: (e: any) => void;
      children?: string;
    }
    const Script: React.ComponentType<ScriptProps>;
    export default Script;
  }

  declare module 'next/font/google' {
    export interface FontOptions {
      subsets?: string[];
      weight?: string | string[];
      style?: string | string[];
      display?: string;
      variable?: string;
      preload?: boolean;
    }
    export interface FontObject {
      className: string;
      style: { fontFamily: string; fontWeight?: number; fontStyle?: string };
      variable: string;
    }
    export function Inter(options?: FontOptions): FontObject;
    export function Roboto(options?: FontOptions): FontObject;
  }

  declare var Link: any;
  declare var Image: any;
  declare var Script: any;
  declare function usePathname(): string;
  declare function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    refresh(): void;
    back(): void;
    forward(): void;
    prefetch(href: string): void;
  };
  declare function useSearchParams(): URLSearchParams;
  declare function redirect(url: string, type?: any): never;
  declare function notFound(): never;
  declare function Inter(options?: any): any;
  declare function setMockPathname(pathname: string): void;
  declare function setMockRouter(router: any): void;
  declare function setMockSearchParams(params: any): void;
  declare function UserBadge(props: { user: any }): React.ReactElement;
  declare var articlesStore: Map<string, any>;

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

  declare var solution: any;
`;

