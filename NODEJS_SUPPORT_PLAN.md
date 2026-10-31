# Node.js Curriculum & Implementation Plan

## 1. Overview & Scope

The Node.js track provides cold-start retrieval challenges on Node.js core runtime internals, server plumbing, event-driven architecture, binary/buffer handling, protocol framing, and module/process lifecycle.

### Non-Overlap Guarantee with `async-js`
The existing `async-js` track focuses on JavaScript language-level asynchronous mechanics:
- Promises, `Promise.all` / `Promise.any` / `Promise.race`, `promisify`, async generator pagination, sleep/delay, exponential backoff retries, polling, cancelable promises via `AbortController`, and concurrency pools (`promisePool`).

The **Node.js track strictly avoids duplicating these patterns**. Instead, it focuses on:
- Event-driven architecture (`EventEmitter`, event listeners, error semantics)
- Binary buffers and byte-level codecs (TLV packet parsing, binary headers)
- Stream backpressure and chunk framing (NDJSON streaming, length-prefixed IPC framing)
- File system and path resolution (POSIX/Windows resolution, path traversal security, virtual in-memory FS)
- Command-line & server internals (CLI argv parser, Radix Trie HTTP router, HTTP content negotiation)
- Module system & process lifecycle (CommonJS loader with circular dependency resolution, graceful shutdown coordination, worker pool dispatching)

---

## 2. Curriculum Structure (15 Cards Across 5 Tiers)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS CURRICULUM                              │
├─────────────────┬──────────────────────────────────────────────────────┤
│ Tier 1 (Novice) │ Event-driven runtime primitives, paths & CLI argv    │
│ Tier 2 (Appr.)  │ Binary Buffers, TLV codecs, query strings & .env     │
│ Tier 3 (Comp.)  │ Stream backpressure, NDJSON, Radix router, headers   │
│ Tier 4 (Prof.)  │ CommonJS module loader, Virtual FS, IPC framing      │
│ Tier 5 (Master) │ Graceful shutdown coordinator, Worker pool routing   │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

### Tier 1: Core Runtime Primitives & Utilities (Completed: 3/3)

#### 1. `node-event-emitter` [DONE]
- **Track**: `node` | **Difficulty**: Tier 1 (Novice)
- **Concept**: `event-emitter`
- **Signature**: `class EventEmitter`
- **Description**: Implement Node.js's core `EventEmitter` pattern supporting `.on(event, listener)`, `.emit(event, ...args)`, `.once(event, listener)`, `.off(event, listener)`, `.prependListener(event, listener)`, and `.listenerCount(event)`. If an `'error'` event is emitted and has no registered listeners, it must throw an Error.
- **Key Edge Cases**: Modifying listener array during `.emit()` must not affect the current dispatch iteration; `.once()` must wrap cleanly and allow removal via `.off()` using original listener reference.

#### 2. `node-path-resolve` [DONE]
- **Track**: `node` | **Difficulty**: Tier 1 (Novice)
- **Concept**: `path-resolution`
- **Signature**: `resolvePath(...segments: string[]): string` and `isSafePath(rootPath: string, userPath: string): boolean`
- **Description**: Normalize and resolve file path segments from right to left until an absolute root is formed (similar to `path.resolve`), handling `.` and `..` properly. Provide `isSafePath` to verify that `userPath` resolved against `rootPath` does not escape `rootPath` (preventing directory traversal attacks like `../../etc/passwd`).
- **Key Edge Cases**: Redundant slashes, trailing slashes, empty segments, and boundary checks (e.g. `/app/data-secret` is not inside `/app/data`).

#### 3. `node-cli-argv-parser` [DONE]
- **Track**: `node` | **Difficulty**: Tier 1 (Novice)
- **Concept**: `cli-tooling`
- **Signature**: `parseArgv(args: string[]): { _: string[]; [key: string]: any }`
- **Description**: Parse CLI arguments (e.g. `process.argv.slice(2)`) into an options object and positional array. Supports short boolean flags (`-v`), combined short flags (`-abc` -> `a: true, b: true, c: true`), long options (`--port 8080`, `--host=localhost`), boolean flags (`--dry-run`), and positional parameters in `_`.
- **Key Edge Cases**: `--` delimiter stops flag parsing (all following items become positional); numeric string coercion for flag values.

---

### Tier 2: Binary & Data Serialization (Completed: 3/3)

#### 4. `node-buffer-tlv-codec` [DONE]
- **Track**: `node` | **Difficulty**: Tier 2 (Apprentice)
- **Concept**: `buffers-binary`
- **Signature**: `encodeTLV(packets: TLVPacket[]): Uint8Array` and `decodeTLV(buffer: Uint8Array): TLVPacket[]`
- **Description**: Implement a binary Tag-Length-Value (TLV) packet encoder and decoder commonly used in binary protocols and network communication. Each field has a 1-byte Type (uint8), a 2-byte Length (uint16 big-endian), followed by the UTF-8 payload.
- **Key Edge Cases**: Truncated buffers throw `Error`; zero-length values; multi-record sequence parsing; multi-byte UTF-8 string encoding/decoding.

#### 5. `node-querystring-parser` [DONE]
- **Track**: `node` | **Difficulty**: Tier 2 (Apprentice)
- **Concept**: `url-query`
- **Signature**: `parseQuery(str: string, sep?: string, eq?: string): ParsedQuery` and `stringifyQuery(obj: QueryInput, sep?: string, eq?: string): string`
- **Description**: Parse and stringify URL query strings supporting percent-encoded characters, repeated keys as arrays (`tag=js&tag=node` -> `tag: ['js', 'node']`), custom delimiters, and omitted values.
- **Key Edge Cases**: Empty values (`flag&key=val`), leading `?` stripping, plus-sign spaces (`+` -> `' '`), custom `sep` and `eq` support.

#### 6. `node-env-parser-expander` [DONE]
- **Track**: `node` | **Difficulty**: Tier 2 (Apprentice)
- **Concept**: `configuration`
- **Signature**: `parseEnv(src: string, baseEnv?: EnvDictionary): EnvDictionary`
- **Description**: Parse `.env` file configuration with variable expansion and default fallbacks. Supports `#` comments, single and double quotes with escape sequences, empty lines, and variable expansion (`${PORT}` or `${PORT:-3000}`).
- **Key Edge Cases**: Mutually recursive or undefined variables resolve to fallback or empty string; preserve internal literal values in single quotes; unescape escape characters in double quotes; inline comments in unquoted values.

---

### Tier 3: Streams, Protocol & Web Server Plumbing (Completed: 4/4)

#### 7. `node-stream-backpressure-pipe` [DONE]
- **Track**: `node` | **Difficulty**: Tier 3 (Competent)
- **Concept**: `streams-backpressure`
- **Signature**: `class BackpressurePipe` with `write(chunk): boolean`, `read(): any`, `on('drain', fn)`, `off('drain', fn)`, `bufferedAmount`, and `isPaused`
- **Description**: Simulate Node.js stream backpressure mechanics. A producer pushes chunks into the pipe. When the buffer size reaches or exceeds `highWaterMark`, `write()` returns `false`, signaling the producer to pause. As consumers read and completely empty the buffer, the pipe emits a `'drain'` event to signal the producer to resume.
- **Key Edge Cases**: Multiple sequential writes exceeding watermark; drain event only fires once after a `false` write was acknowledged and buffer empties.

#### 8. `node-ndjson-stream-splitter` [DONE]
- **Track**: `node` | **Difficulty**: Tier 3 (Competent)
- **Concept**: `streaming-parser`
- **Signature**: `class NDJSONSplitter` with `push(chunk: string): JsonRecord[]`, `flush(): JsonRecord[]`, and `remainder: string`
- **Description**: Streaming line-delimited JSON (NDJSON) parser that receives arbitrary string chunks (which may split lines across chunk boundaries), buffers incomplete line fragments, and emits parsed JSON objects immediately upon completing each line.
- **Key Edge Cases**: Chunks splitting in the middle of a JSON token; empty lines and whitespace ignored; remainder tracking; flush parses trailing non-newline data.

#### 9. `node-radix-trie-router` [DONE]
- **Track**: `node` | **Difficulty**: Tier 3 (Competent)
- **Concept**: `http-routing`
- **Signature**: `class RadixRouter` with `add(method, path, handler)` and `find(method, path): RouteMatch | null`
- **Description**: High-performance HTTP trie router supporting exact routes (`/api/v1/health`), parameterized segments (`/users/:userId/posts/:postId`), and wildcard prefix catch-alls (`/static/*filepath`).
- **Key Edge Cases**: Parameter precedence (exact matches prefer over `:param`, which prefer over `*`); trailing slashes; root `/` handling; method mismatch returns null.

#### 10. `node-http-accept-negotiator` [DONE]
- **Track**: `node` | **Difficulty**: Tier 3 (Competent)
- **Concept**: `http-content-negotiation`
- **Signature**: `negotiateAccept(acceptHeader: string | null, availableTypes: string[]): string | null`
- **Description**: Parse HTTP `Accept` headers with quality values (e.g. `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`) and select the best matching MIME type from `availableTypes` according to RFC 7231 specificity rules.
- **Key Edge Cases**: Type specificity preference (e.g. `text/html` beats `text/*`, which beats `*/*` at equal `q` values); `q=0` explicit disallow; fallback for missing header or empty list.

---

### Tier 4: Architecture, Process & Modules

#### 11. `node-commonjs-module-loader`
- **Track**: `node` | **Difficulty**: Tier 4 (Proficient)
- **Concept**: `module-system`
- **Signature**: `createModuleLoader(files: Record<string, string>): { require(id: string): any }`
- **Description**: Implement an in-memory CommonJS module loader and module cache. Executes module code in an isolated scope with `module`, `exports`, `require`, and `__filename`. Handles relative path resolution and successfully resolves circular dependencies via cached `module.exports` object references.
- **Key Edge Cases**: Circular `require()` references return partially evaluated exports; re-requiring the same path returns cached instance without re-evaluating.

#### 12. `node-virtual-fs`
- **Track**: `node` | **Difficulty**: Tier 4 (Proficient)
- **Concept**: `file-system`
- **Signature**: `class VirtualFS` with `mkdirp(path)`, `writeFile(path, data)`, `readFile(path)`, `readdir(path, options?)`, `stat(path)`, and `rmdir(path, { recursive: true })`
- **Description**: In-memory hierarchical filesystem tree implementing POSIX-like operations: directory creation (`mkdirp`), atomic file writes, recursive directory reads with entry types (file vs directory), file stats (size, timestamps), and recursive deletion.
- **Key Edge Cases**: Overwriting existing files; reading non-existent paths throws `ENOENT`; writing to a non-existent parent directory throws `ENOENT` unless `mkdirp` was called.

#### 13. `node-length-prefixed-ipc-framing`
- **Track**: `node` | **Difficulty**: Tier 4 (Proficient)
- **Concept**: `ipc-protocol`
- **Signature**: `class FrameDecoder` with `write(chunk: Uint8Array): Uint8Array[]` and `encodeFrame(payload: Uint8Array): Uint8Array`
- **Description**: Message framing protocol for streaming sockets / IPC. Encodes payloads with a 4-byte big-endian unsigned integer header representing message length. The decoder handles arbitrary chunk fragmentation (a chunk containing half a header, multiple messages, or an incomplete body).
- **Key Edge Cases**: Multiple messages in a single packet; packet boundary splitting the 4-byte length header; zero-length payload frames.

---

### Tier 5: Distributed, Resilience & Concurrency

#### 14. `node-graceful-shutdown-coordinator`
- **Track**: `node` | **Difficulty**: Tier 5 (Master)
- **Concept**: `process-lifecycle`
- **Signature**: `class GracefulShutdownCoordinator` with `register(name: string, handler: () => Promise<void>, options?: { timeoutMs?: number; priority?: number }): void` and `shutdown(signal: string): Promise<ShutdownReport>`
- **Description**: Process lifecycle coordinator for production Node.js services. Executes cleanup handlers in descending priority order (e.g. stop accepting new HTTP requests first, drain database connections second). Guarantees shutdown within a global deadline, timing out hanging handlers and reporting failure states.
- **Key Edge Cases**: Duplicate shutdown signals (idempotent trigger); one failing handler does not abort subsequent cleanup handlers; priority grouping runs same-priority handlers concurrently.

#### 15. `node-worker-pool-dispatcher`
- **Track**: `node` | **Difficulty**: Tier 5 (Master)
- **Concept**: `worker-threads`
- **Signature**: `class WorkerPoolDispatcher` with `dispatch(taskData: any): Promise<any>` and `handleWorkerCrash(workerId: string): void`
- **Description**: Simulated worker pool manager implementing least-busy worker routing, bounded concurrency, pending task FIFO queues, and crash resilience. If a worker crashes while processing a task, the task is re-queued and a replacement worker is initialized.
- **Key Edge Cases**: Backpressure queue rejection when queue limit is reached; task retry limits on repeated worker crashes.

---

## 3. Summary of Cards

| ID | Title | Track | Tier | Key Concept |
|---|---|---|---|---|
| `node-event-emitter` | Custom EventEmitter with Prepend & Error Trapping | `node` | Tier 1 | `event-emitter` |
| `node-path-resolve` | Path Resolution & Traversal Guard | `node` | Tier 1 | `path-resolution` |
| `node-cli-argv-parser` | CLI Argument & Option Parser | `node` | Tier 1 | `cli-tooling` |
| `node-buffer-tlv-codec` | Binary Tag-Length-Value (TLV) Codec | `node` | Tier 2 | `buffers-binary` |
| `node-querystring-parser` | Query String Parser with Bracket Arrays | `node` | Tier 2 | `url-query` |
| `node-env-parser-expander` | .env Config Parser with Variable Expansion | `node` | Tier 2 | `configuration` |
| `node-stream-backpressure-pipe` | Stream Backpressure & Drain Simulator | `node` | Tier 3 | `streams-backpressure` |
| `node-ndjson-stream-splitter` | Line-Delimited JSON Streaming Chunker | `node` | Tier 3 | `stream-chunking` |
| `node-radix-trie-router` | Radix Trie HTTP Route Matcher | `node` | Tier 3 | `http-routing` |
| `node-http-accept-negotiator` | HTTP Accept Header Content Negotiator | `node` | Tier 3 | `http-protocol` |
| `node-commonjs-module-loader` | CommonJS Loader & Circular Cache | `node` | Tier 4 | `module-system` |
| `node-virtual-fs` | Virtual In-Memory Filesystem | `node` | Tier 4 | `file-system` |
| `node-length-prefixed-ipc-framing` | Length-Prefixed Stream Message Framer | `node` | Tier 4 | `ipc-protocol` |
| `node-graceful-shutdown-coordinator` | Graceful Shutdown & Priority Lifecycle Manager | `node` | Tier 5 | `process-lifecycle` |
| `node-worker-pool-dispatcher` | Worker Pool Least-Busy Router & Crash Recovery | `node` | Tier 5 | `worker-threads` |
