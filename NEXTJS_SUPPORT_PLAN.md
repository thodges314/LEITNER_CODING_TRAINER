# Next.js App Router Expansion & Architecture Plan

## 1. Vision & Core Philosophy

Next.js (specifically the modern **App Router** paradigm introduced in Next.js 13/14/15) represents the industry standard for production full-stack React engineering. Mastering Next.js is essential for modern senior frontend and full-stack interviews.

### Core Objectives
1. **App Router Over Pages Router:** Focus entirely on modern App Router architecture: Route Handlers (`route.ts`), Server Actions (`'use server'`), Edge Middleware (`middleware.ts`), Dynamic Metadata (`generateMetadata`), Static Route Generation (`generateStaticParams`), and Cache Tag Revalidation (`revalidateTag`).
2. **Realistic Application Context Framing:** Each card's prompt begins with a concise `### Application Context` section (2–3 sentences) anchoring the exercise in a realistic hypothetical application (e.g. an e-commerce catalog, team workspace, or SaaS dashboard) and specifying the exact project file path (e.g. `app/api/products/[id]/route.ts`, `middleware.ts`, `app/checkout/actions.ts`).
3. **Pure Execution Sandboxing:** Avoid requiring background Node.js server daemons or heavy npm dependencies in the browser. Next.js contracts execute as pure Web Standard `Request` / `Response` contracts, server action state reducers, and cache simulators.
4. **Zero-Import Sandbox Scope:** Following the trainer's core architectural rules, `NextResponse`, `NextRequest`, and cache utilities are injected directly into the runner scope. Ambient TypeScript definitions enable full autocomplete and strict type checking without requiring learners to type `import { NextResponse } from 'next/server'`.
5. **Exclusively TypeScript Mode (`TS_ONLY_TRACKS`):** Next.js App Router applications in modern industry practice are authored almost exclusively in TypeScript. Cards in the `nextjs` track are registered in `TS_ONLY_TRACKS` (`isTsOnlyCard`), locking the practice arena into strict TypeScript mode with extracted interface prompt blocks, full Monaco autocomplete, and compile-time type verification. Canonical solutions provide both `.ref.ts` and `.ref.js`.

---

## 2. Sandbox Runtime & Ambient Type Architecture

### 2.1 Runtime Injections (`src/utils/nextSandbox.ts` & `src/lib/runner.ts`)
To allow learners to write clean, standard Next.js code without import overhead, the execution sandbox injects lightweight, zero-dependency browser-compatible shims for standard Next.js symbols:

- **`NextResponse`**:
  - `NextResponse.json(body, init?)`: Returns a `Response` with `application/json` content-type header and JSON body.
  - `NextResponse.redirect(url, status = 307)`: Returns a redirect `Response` with `Location` header.
  - `NextResponse.rewrite(url, init?)`: Returns a `Response` tracking rewritten URL destination.
  - `NextResponse.next(init?)`: Returns a pass-through response for Edge Middleware chains.
- **`NextRequest`**:
  - Wraps standard `Request` with `nextUrl` (`URL` instance with parsed searchParams) and `cookies` (`Map` with `.get(name)`, `.has(name)`, `.set(name, val)`, `.delete(name)`).
- **Cache Revalidation Helpers**:
  - `revalidateTag(tag: string)`: Marks cache tags as stale in the simulated tag store.
  - `revalidatePath(path: string, type?: 'page' | 'layout')`: Marks path caches as stale.

### 2.2 Ambient TypeScript Declarations (`src/utils/sandboxNextTypes.ts`)
Appended to the Monaco/TypeScript sandbox globals so that TS mode recognizes:
- `NextRequest`, `NextResponse`, `Metadata`, `ResolvingMetadata`
- Standard module declarations for `'next/server'`, `'next/navigation'`, and `'next/cache'`
- Extracted domain interfaces for each card (e.g. `RouteParams`, `ActionState`, `PageMetadataProps`).

### 2.3 Preloaded Scope Warning Hints (`src/utils/cardPromptTypes.ts`)
Add `NEXT_SANDBOX_APIS = ['NextResponse', 'NextRequest', 'revalidateTag', 'revalidatePath']` to automatically inform learners if they write redundant `import { NextResponse } from 'next/server'`, reminding them that the symbol is preloaded in the evaluation scope.

---

## 3. Curriculum Roadmap & Batch Plan

### Batch 1: Core App Router Conventions (3 Cards)
- **`next-route-handler-crud`**
  - *Context:* `app/api/items/[id]/route.ts` in an inventory management service.
  - *Contract:* Exports `GET(request, { params })` and `POST(request)` handling URL params, JSON request payloads, status codes (200, 201, 400, 404), and query search parameters using `NextResponse.json()`.
- **`next-server-action-form`**
  - *Context:* `app/checkout/actions.ts` handling customer checkout submissions.
  - *Contract:* Async server action `updateItemQuantity(prevState, formData)` that validates inputs, returns structured field errors (`{ errors: { quantity?: string } }`) on invalid data, and returns `{ success: true, updatedQuantity }` on valid submission.
- **`next-middleware-auth-redirect`**
  - *Context:* `middleware.ts` running at the Edge in a multi-tenant application.
  - *Contract:* `middleware(request: NextRequest)` checking authentication cookies (`auth_token`), protecting `/dashboard/*` paths by redirecting unauthenticated users to `/login?next=...`, and letting public paths (`/`, `/about`, `/login`) pass through with `NextResponse.next()`.

### Batch 2: Static Generation, Dynamic Metadata & Caching (3 Cards) - COMPLETE
- **`next-generate-metadata`**
  - *Context:* `app/products/[category]/[slug]/page.tsx` for SEO and social sharing cards.
  - *Contract:* `generateMetadata({ params, searchParams }): Promise<Metadata>` building dynamic page title (`"{product.name} | Store"`), meta description, canonical URL, and OpenGraph image tags.
- **`next-static-params-generator`**
  - *Context:* `app/catalog/[category]/[slug]/page.tsx` pre-rendering product matrices at build time.
  - *Contract:* `generateStaticParams()` reading hierarchical catalog definitions and returning a flattened array of route param objects: `[{ category: 'shoes', slug: 'running' }, ...]`.
- **`next-revalidation-tag-cache`**
  - *Context:* `app/lib/cache.ts` managing on-demand incremental static regeneration (ISR).
  - *Contract:* Implements tag-based cache storage supporting `{ next: { tags: ['products', 'item-123'] } }` and an invalidation function `revalidateTag(tag)` that purges all entries associated with that tag.

### Batch 3: Modern App Router Typing & Component Conventions (3 Cards) - COMPLETE
- **`next-async-page-props`**
  - *Context:* `app/shop/[id]/page.tsx` in a Next.js 15 product catalog.
  - *Contract:* Handles the Next.js 15 async shift where `params` and `searchParams` are Promises. Implements an async page parser/helper that awaits `params: Promise<{ id: string }>` and safely normalizes `searchParams: Promise<Record<string, string | string[] | undefined>>` (handling multi-value query arrays vs single strings).
- **`next-async-route-handler-context`**
  - *Context:* `app/api/users/[userId]/posts/[postId]/route.ts` in an API service.
  - *Contract:* Strict type safety for Next.js 15 route handler context where `context: { params: Promise<{ userId: string; postId: string }> }`. Awaits dynamic multi-segment parameters and returns typed JSON responses.
- **`next-layout-template-composition`**
  - *Context:* `app/dashboard/layout.tsx` vs `app/dashboard/template.tsx` composition.
  - *Contract:* Enforces `React.ReactNode` children typing and models the core architectural distinction: Layout preserves state across route changes while Template remounts its component tree with fresh state.

### Batch 4: Advanced Architecture & RSC Boundaries (2 Cards) - COMPLETE
- **`next-client-boundary-guard`**
  - *Context:* React Server Component (RSC) to Client Component prop boundary serializer.
  - *Contract:* Validates props passed across the network boundary, ensuring all passed values are JSON-serializable primitives/objects/arrays, and flagging forbidden values (functions, symbols, class instances) with descriptive serialization errors.
- **`next-parallel-intercepting-routes`**
  - *Context:* Photo gallery feed with parallel modal view (`app/feed/@modal/(.)photo/[id]/page.tsx`).
  - *Contract:* Route matching function evaluating URL navigation to determine whether to trigger an intercepting route modal slot or fall back to full page route render.

---

## 4. Track Structure & Integration - ALL 11 CARDS COMPLETE

- **Track ID:** `nextjs` (first-class domain track)
- **Track Metadata:**
  - Label: `Next.js`
  - Color Theme: Slate / Dark Neutral (`#0f172a` badge, modern aesthetic)
  - Preset Decks: Included in **Full Library**, **Full-Stack Core**, and **Frontend Specialist**
- **Difficulty Ladder:**
  - Tier 1: `next-route-handler-crud`, `next-server-action-form`, `next-layout-template-composition`
  - Tier 2: `next-middleware-auth-redirect`, `next-generate-metadata`, `next-async-page-props`
  - Tier 3: `next-static-params-generator`, `next-revalidation-tag-cache`, `next-async-route-handler-context`
  - Tier 4: `next-client-boundary-guard`, `next-parallel-intercepting-routes`

---

## 5. Verification Checklist for Each Batch

1. `scripts/cards/<id>.prompt.txt`: Clean Markdown, `### Application Context` framing, extracted TypeScript types, readable `### signature` heading.
2. `scripts/cards/<id>.ref.js`: Modern arrow function implementation, zero `import`/`export`.
3. `scripts/cards/<id>.ref.ts`: Synchronized TypeScript implementation using extracted prompt types.
4. `scripts/cards/<id>.meta.json`: Track, tags, difficulty, `requiresDom: false`.
5. `scripts/testcases/partN.mjs`: At least 4 concrete contract test cases per card.
6. Verification commands:
   - `npm run build:cards`
   - `GROQ_API_KEY=unused node scripts/enrich-complexities.mjs`
   - `npx tsc -b`
   - `npm run lint`
   - `npm test`
   - Mutation check: `VITE_MUT_ONLY='<id>' npm run mutation`

