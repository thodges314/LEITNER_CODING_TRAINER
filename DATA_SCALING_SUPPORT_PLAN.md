# Data Scaling & Streams Curriculum Support Plan

## 1. Overview
The **Data Scaling & Streams** curriculum trains situational awareness and coding execution for high-throughput, memory-bounded, and asynchronous data processing in the application layer. Rather than requiring specialized database configurations, it focuses on real-world engineering patterns: chunking, time/count window batching, stream transformations, backpressure flow control, and rate shaping.

Following **Option B**, cards are integrated into their natural parent tracks (`async-js`, `node`, `graphql-server`, `algorithms`), cross-tagged with `#streams`, `#scaling`, `#batching`, and `#backpressure`, and grouped into a dedicated 5th built-in preset deck: **Data Scaling & Streams**.

---

## 2. Curriculum Composition (16 Cards)

### A. Pre-Existing Foundational Cards (11 Cards)
1. **`async-generator-pagination`** (`async-js`): Cursor-based streaming pagination (`async function* paginateAll`).
2. **`promise-pool`** (`async-js`): Concurrency-limited execution pool (`concurrency: N`).
3. **`async-queue-scheduler`** (`async-js`): Priority task queue with concurrency limits and cancellation.
4. **`graphql-dataloader-batching`** (`graphql-server`): Microtask-tick N+1 query batching.
5. **`graphql-query-complexity-calculator`** (`graphql-server`): Query depth & recursive cost limiting protecting servers against recursive DoS attacks.
6. **`graphql-relay-pagination-merger`** (`graphql`): Relay Cursor Connection specification mapping (`edges`, `node`, `pageInfo`) for infinite scroll.
7. **`graphql-relay-connection-builder`** (`graphql-server`): Server-side Relay connection builder.
8. **`node-stream-backpressure-pipe`** (`node`): Flow control with `highWaterMark`, `write() -> false`, and `drain`.
9. **`node-ndjson-stream-splitter`** (`node`): Streaming newline parser with chunked buffers.
10. **`node-length-prefixed-ipc-framing`** (`node`): Binary protocol framing and stream chunk reassembly.
11. **`node-worker-pool-dispatcher`** (`node`): Bounded CPU/IO task offloading across worker threads.

### B. New High-Yield Cards (5 Cards)

#### Batch 1: Buffering, Windowing & Web Streams (2 Cards)
1. **`stream-event-micro-batcher`** (`async-js`): [x] Done
   - *Problem:* Real-time event streams (telemetry, WebSockets, Kafka consumers) pushing high volumes of items that must not crash downstream systems with individual I/O writes.
   - *Contract:* Micro-batch accumulator flushing when `items.length >= maxBatchSize` OR `timeElapsed >= maxWaitMs` (whichever comes first), with concurrent flush locking and `.flushSync()`.
2. **`web-stream-transform-pipeline`** (`async-js`): [x] Done
   - *Problem:* Edge functions, Cloudflare Workers, and modern browsers use the Web Streams API rather than Node streams.
   - *Contract:* Custom `TransformStream` implementation with `transform(chunk, controller)` and `flush(controller)` for chunk sanitization, parsing, and pipeline composition (`readable.pipeThrough(transform).pipeTo(writable)`).

#### Batch 2: Chunking, Rate-Shaping & K-Way Stream Merge (3 Cards)
3. **`chunked-batch-pipeline`** (`async-js`): [x] Done
   - *Problem:* Bulk webhook payloads (e.g. 50,000 orders) that exceed external API payload limits and need concurrent chunk execution with partial failure tolerance.
   - *Contract:* Slices large arrays into size-$N$ chunks, executes chunks concurrently up to limit $C$, collects successful items, and categorizes errors into a dead-letter registry without failing the whole batch.
4. **`stream-token-bucket-shaper`** (`async-js`): [x] Done
   - *Problem:* Continuous high-throughput data streams that must be smoothed to adhere to downstream bandwidth or rate constraints.
   - *Contract:* Token-bucket stream rate shaper that emits items based on continuous token replenishment, buffering bursts without dropping data.
5. **`k-way-stream-merger`** (`algorithms`): [x] Done
   - *Problem:* Classic data scaling interview question: $K$ pre-sorted streams/generators too large to fit in memory.
   - *Contract:* Stream generator that uses a Min-Heap priority queue to merge $K$ sorted streams into a single globally sorted output in $O(N \log K)$ time and $O(K)$ space.

---

## 3. Built-In Preset Deck Integration (`src/lib/decks.ts`)
- **Deck ID:** `data-scaling-streams`
- **Name:** `Data Scaling & Streams`
- **Description:** `High-throughput data streaming, memory-bounded pagination, reactive event batching, Web Streams pipelines, and flow-control backpressure`
- **Filter:** Matches cards with tags `streams`, `scaling`, `batching`, `backpressure`, or the explicit set of 16 curriculum cards.
- **Verification:** Unit tests in `src/lib/decks.test.ts` verifying deck inclusion and card counts.

---

## 4. Verification Checklist
- [x] All 5 cards authored with `.prompt.txt`, `.ref.js`, `.ref.ts`, `.meta.json`, `.harness.js`
- [x] Test cases authored in `part60.mjs` and `part61.mjs`
- [x] Web Streams ambient types declared in `src/utils/typeChecker.ts`
- [x] `npm run build:cards` & `node scripts/enrich-complexities.mjs` compiled 395 cards
- [x] `npm run check:cards` passes (0 stale cards)
- [x] `scripts/mutation.test.ts` passes (0 mutants survived)
- [x] `npx tsc -b` passes (0 type errors)
- [x] `npm run lint` passes (0 lint errors)
- [x] `npm test` passes (2,532 tests across 70 files)
- [x] `npx playwright test` passes (857 tests across 17 files)

