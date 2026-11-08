import { describe, it, expect, beforeEach } from 'vitest';
import {
  NextResponse,
  NextRequest,
  revalidateTag,
  revalidatePath,
  activeRevalidationStore,
  resetRevalidationStore,
  after,
  flushAfterTasks,
  resetAfterTasks,
  scheduledAfterTasks,
} from './nextSandbox';

describe('nextSandbox runtime shims', () => {
  beforeEach(() => {
    resetRevalidationStore();
    resetAfterTasks();
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

  describe('after() lifecycle helper', () => {
    it('queues tasks without executing synchronously', () => {
      let executed = false;
      after(() => {
        executed = true;
      });
      expect(executed).toBe(false);
      expect(scheduledAfterTasks.length).toBe(1);
    });

    it('flushes queued async tasks and clears queue', async () => {
      const order: number[] = [];
      after(async () => {
        order.push(1);
      });
      after(() => {
        order.push(2);
      });
      expect(scheduledAfterTasks.length).toBe(2);
      await flushAfterTasks();
      expect(order).toEqual([1, 2]);
      expect(scheduledAfterTasks.length).toBe(0);
    });
  });
});

