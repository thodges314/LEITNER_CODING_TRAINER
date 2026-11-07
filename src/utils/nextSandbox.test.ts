import { describe, it, expect, beforeEach } from 'vitest';
import {
  NextResponse,
  NextRequest,
  revalidateTag,
  revalidatePath,
  activeRevalidationStore,
  resetRevalidationStore,
} from './nextSandbox';

describe('nextSandbox runtime shims', () => {
  beforeEach(() => {
    resetRevalidationStore();
  });

  describe('NextResponse', () => {
    it('creates json response with correct status, content-type and body', async () => {
      const res = NextResponse.json({ ok: true, count: 5 }, { status: 201 });
      expect(res.status).toBe(201);
      expect(res.headers.get('content-type')).toBe('application/json');
      const data = await res.json();
      expect(data).toEqual({ ok: true, count: 5 });
    });

    it('creates redirect response with 307 default status and location header', () => {
      const res = NextResponse.redirect('https://example.com/login?next=/dashboard');
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('https://example.com/login?next=/dashboard');
    });

    it('creates redirect response with custom status', () => {
      const res = NextResponse.redirect('/new-path', 301);
      expect(res.status).toBe(301);
      expect(res.headers.get('location')).toBe('/new-path');
    });

    it('creates rewrite response and tracks rewrite destination', () => {
      const res = NextResponse.rewrite('https://example.com/tenant-123/feed');
      expect(res._rewriteUrl).toBe('https://example.com/tenant-123/feed');
    });

    it('creates next pass-through response', () => {
      const res = NextResponse.next();
      expect(res._isNext).toBe(true);
    });
  });

  describe('NextRequest', () => {
    it('parses nextUrl searchParams from url string', () => {
      const req = new NextRequest('http://localhost:3000/api/items?category=shoes&sort=asc');
      expect(req.nextUrl.pathname).toBe('/api/items');
      expect(req.nextUrl.searchParams.get('category')).toBe('shoes');
      expect(req.nextUrl.searchParams.get('sort')).toBe('asc');
    });

    it('parses cookies from cookie header and init object', () => {
      const req = new NextRequest('http://localhost:3000/dashboard', {
        headers: { cookie: 'auth_token=secret123; theme=dark' },
      });
      expect(req.cookies.has('auth_token')).toBe(true);
      expect(req.cookies.get('auth_token')?.value).toBe('secret123');
      expect(req.cookies.get('theme')?.value).toBe('dark');
      expect(req.cookies.has('missing')).toBe(false);
      expect(req.cookies.getAll()).toHaveLength(2);
    });
  });

  describe('Revalidation helpers', () => {
    it('tracks revalidateTag in activeRevalidationStore', () => {
      revalidateTag('products');
      revalidateTag('categories');
      expect(activeRevalidationStore.tags.has('products')).toBe(true);
      expect(activeRevalidationStore.tags.has('categories')).toBe(true);
      expect(activeRevalidationStore.tags.has('users')).toBe(false);
    });

    it('tracks revalidatePath in activeRevalidationStore', () => {
      revalidatePath('/products/[id]');
      expect(activeRevalidationStore.paths.has('/products/[id]')).toBe(true);
      expect(activeRevalidationStore.paths.has('/cart')).toBe(false);
    });
  });
});

