import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js component harness', ...o });

export default {
  'next-nested-static-params-matrix': [
    r(
      'Generates static params for flat articles in a single category',
      'generateStaticParams([{ category: "tutorials", articles: [{ slug: "intro" }, { slug: "getting-started" }] }])',
      '[{ category: "tutorials", slug: ["intro"] }, { category: "tutorials", slug: ["getting-started"] }]'
    ),
    r(
      'Generates nested Cartesian product for recursive subpage trees',
      'generateStaticParams([{ category: "docs", articles: [{ slug: "routing", subpages: [{ slug: "dynamic-routes", subpages: [{ slug: "catch-all" }] }, { slug: "parallel-routes" }] }] }, { category: "api", articles: [{ slug: "headers" }] }])',
      '[{ category: "docs", slug: ["routing"] }, { category: "docs", slug: ["routing", "dynamic-routes"] }, { category: "docs", slug: ["routing", "dynamic-routes", "catch-all"] }, { category: "docs", slug: ["routing", "parallel-routes"] }, { category: "api", slug: ["headers"] }]'
    ),
    r(
      'Trims and URI-decodes encoded category and slug segments',
      'generateStaticParams([{ category: " web%20dev ", articles: [{ slug: " next%20js ", subpages: [{ slug: " app%2Frouter " }] }] }])',
      '[{ category: "web dev", slug: ["next js"] }, { category: "web dev", slug: ["next js", "app/router"] }]'
    ),
    r(
      'Safely ignores empty categories, invalid slug nodes, and empty input trees',
      'generateStaticParams([{ category: "   ", articles: [{ slug: "valid" }] }, { category: "guides", articles: [{ slug: "" }, { slug: "valid-guide" }] }])',
      '[{ category: "guides", slug: ["valid-guide"] }]'
    ),
  ],

  'next-optimistic-action-mutation': [
    r(
      'Renders initial todo items with correct completed status and button text',
      '<TodoListOptimistic initialTodos={[{ id: "1", title: "Write tests", completed: false }, { id: "2", title: "Deploy release", completed: true }]} onToggleAction={async () => {}} />',
      'renders button 1 as "Pending" (aria-pressed=false) and button 2 as "Completed" (aria-pressed=true)'
    ),
    r(
      'Applies optimistic state immediately with pending badge during transition',
      'fire.click(todoToggle1)',
      'immediately flips button 1 to "Completed" and displays Saving... pending-badge'
    ),
    r(
      'Commits successful state when Server Action resolves',
      'await onToggleAction resolves',
      'removes pending-badge and retains committed "Completed" state'
    ),
    r(
      'Automatically rolls back optimistic update and renders error message when Server Action rejects',
      'await onToggleAction throws Error("Database unavailable")',
      'reverts button 1 back to "Pending" and displays optimistic-error message'
    ),
  ],

  'next-route-segment-config-resolver': [
    r(
      'Resolves default static configuration for clean route segments',
      'resolveRouteSegmentConfig([{ segmentPath: "app/layout.tsx" }, { segmentPath: "app/about/page.tsx" }])',
      '{ effectiveDynamic: "auto", effectiveRevalidate: false, effectiveFetchCache: "auto", routeMode: "static", hasConflict: false }'
    ),
    r(
      'Calculates lowest positive revalidate interval for ISR routes across layout and page',
      'resolveRouteSegmentConfig([{ segmentPath: "app/layout.tsx", revalidate: 3600 }, { segmentPath: "app/blog/layout.tsx", revalidate: 300 }, { segmentPath: "app/blog/[slug]/page.tsx", revalidate: 60 }])',
      '{ effectiveRevalidate: 60, routeMode: "isr", hasConflict: false }'
    ),
    r(
      'Resolves dynamic route when any segment declares force-dynamic or revalidate = 0',
      'resolveRouteSegmentConfig([{ segmentPath: "app/layout.tsx" }, { segmentPath: "app/dashboard/page.tsx", dynamic: "force-dynamic" }])',
      '{ effectiveDynamic: "force-dynamic", routeMode: "dynamic" }'
    ),
    r(
      'Detects conflicting segment configurations combining force-static with dynamic behaviors',
      'resolveRouteSegmentConfig([{ segmentPath: "app/layout.tsx", dynamic: "force-static" }, { segmentPath: "app/checkout/page.tsx", dynamic: "force-dynamic" }])',
      '{ hasConflict: true, conflictReason: "Conflicting segment options: cannot combine force-static with force-dynamic..." }'
    ),
  ],

  'next-after-lifecycle-deferred': [
    r(
      'Returns HTTP 201 immediately and queues non-blocking after() tasks for background processing',
      'POST(new Request("http://localhost:3000/api/orders", { method: "POST", body: JSON.stringify({ orderId: "ord-101", customerEmail: "alex@example.com", amount: 149.99 }) }))',
      '{ status: 201, body: { success: true, orderId: "ord-101", status: "confirmed" } }; after flush: sendOrderReceipt and recordAuditLog executed'
    ),
    r(
      'Returns HTTP 400 for invalid email or non-positive amount and skips after()',
      'POST(new Request("http://localhost:3000/api/orders", { method: "POST", body: JSON.stringify({ orderId: "ord-102", customerEmail: "invalid", amount: -10 }) }))',
      '{ status: 400, body: { error: "Invalid order payload" } }; zero after() tasks queued'
    ),
    r(
      'Returns HTTP 500 when synchronous order processing throws and skips after()',
      'POST(new Request("http://localhost:3000/api/orders", { method: "POST", body: JSON.stringify({ orderId: "ord-103", customerEmail: "taylor@example.com", amount: 45.0 }) })) with throwing processOrder',
      '{ status: 500, body: { error: "Order processing failed" } }; zero after() tasks queued'
    ),
    r(
      'Sequentially queues and flushes isolated after() callbacks for multiple independent requests',
      'POST(orderA) then POST(orderB); flushAfterTasks()',
      'both responses return 201 immediately; flush executes receipt and audit for both orders without crosstalk'
    ),
  ],

  'next-ppr-streaming-boundaries': [
    r(
      'Renders static product shell and Suspense skeleton fallbacks immediately on initial mount',
      '<ProductPPRPage product={sampleProduct} inventoryPromise={invPromise} reviewsPromise={revPromise} />',
      'static-product-shell, product-title, and price rendered; inventory-skeleton and reviews-skeleton active'
    ),
    r(
      'Streams and displays inventory status when inventory promise resolves while reviews are pending',
      'invPromise resolves with { stockCount: 18, warehouse: "Denver Hub", lowStockAlert: false }',
      'inventory-status displays "18 in stock (Denver Hub)"; reviews-skeleton remains pending'
    ),
    r(
      'Streams and displays reviews list when reviews promise resolves independently',
      'revPromise resolves with 2 review items',
      'reviews-list renders review items; reviews-skeleton unmounts'
    ),
    r(
      'Renders low-stock warning and handles empty reviews list',
      'invPromise resolves with lowStockAlert: true; revPromise resolves with []',
      'inventory-status contains "Only 3 left!"; no-reviews message displayed'
    ),
  ],
};
