import { c } from './part1.mjs';

export default {
  'node-event-emitter': [
    c(
      'Registers listeners with .on and invokes them in order with args',
      'const ee = new EventEmitter();\nconst res = [];\nee.on("data", (a, b) => res.push(a + b));\nee.on("data", (a, b) => res.push(a * b));\nee.emit("data", 3, 4);\nres',
      '[7, 12]'
    ),
    c(
      'prependListener executes before existing listeners',
      'const ee = new EventEmitter();\nconst res = [];\nee.on("greet", (name) => res.push("hello " + name));\nee.prependListener("greet", (name) => res.push("first " + name));\nee.emit("greet", "alice");\nres',
      '["first alice", "hello alice"]'
    ),
    c(
      'once fires exactly once and unregisters automatically',
      'const ee = new EventEmitter();\nlet count = 0;\nee.once("ping", () => count++);\nee.emit("ping");\nee.emit("ping");\n[count, ee.listenerCount("ping")]',
      '[1, 0]'
    ),
    c(
      'off removes registered listener and once wrapper',
      'const ee = new EventEmitter();\nlet c1 = 0, c2 = 0;\nconst fn1 = () => c1++;\nconst fn2 = () => c2++;\nee.on("msg", fn1);\nee.once("msg", fn2);\nee.off("msg", fn1);\nee.off("msg", fn2);\nee.emit("msg");\n[c1, c2, ee.listenerCount("msg")]',
      '[0, 0, 0]'
    ),
    c(
      'Unhandled error event throws the error argument',
      'const ee = new EventEmitter();\nlet caught = "";\ntry { ee.emit("error", new Error("boom")); } catch (e) { caught = e.message; }\ncaught',
      '"boom"'
    ),
    c(
      'Handled error event invokes listener without throwing',
      'const ee = new EventEmitter();\nlet caught = "";\nee.on("error", (err) => { caught = err.message; });\nee.emit("error", new Error("handled"));\ncaught',
      '"handled"'
    ),
    c(
      'emit returns true if event had listeners, false otherwise',
      'const ee = new EventEmitter();\nee.on("ping", () => {});\n[ee.emit("ping"), ee.emit("pong")]',
      '[true, false]'
    ),
  ],

  'node-path-resolve': [
    c(
      'Resolves relative segments to absolute root',
      'resolvePath("a", "b", "c")',
      '"/a/b/c"'
    ),
    c(
      'Resolves from right-to-left when an absolute path segment is encountered',
      'resolvePath("/var/log", "/etc", "nginx/nginx.conf")',
      '"/etc/nginx/nginx.conf"'
    ),
    c(
      'Normalizes . and .. parent directory segments and collapses redundant slashes',
      'resolvePath("/app/src/../dist/./bundle//app.js")',
      '"/app/dist/bundle/app.js"'
    ),
    c(
      'isSafePath returns true for valid subpaths and exact match',
      '[isSafePath("/app/uploads", "images/photo.png"), isSafePath("/app/uploads", "/app/uploads")]',
      '[true, true]'
    ),
    c(
      'isSafePath returns false for directory traversal escaping root',
      '[isSafePath("/app/uploads", "../../etc/passwd"), isSafePath("/app/uploads", "../uploads-secret")]',
      '[false, false]'
    ),
    c(
      'isSafePath prevents prefix collision where another dir shares the name prefix',
      'isSafePath("/app/data", "/app/data-secret/file.txt")',
      'false'
    ),
  ],

  'node-cli-argv-parser': [
    c(
      'Parses short boolean flags and combined short flags',
      'parseArgv(["-v", "-abc"])',
      '{"_":[],"v":true,"a":true,"b":true,"c":true}'
    ),
    c(
      'Parses short flag with non-flag argument and coerces number',
      'parseArgv(["-p", "8080", "server.js"])',
      '{"_":["server.js"],"p":8080}'
    ),
    c(
      'Parses long options with = syntax and boolean flags',
      'parseArgv(["--port=3000", "--host", "localhost", "--dry-run", "--no-watch"])',
      '{"_":[],"port":3000,"host":"localhost","dry-run":true,"watch":false}'
    ),
    c(
      'Standalone -- stops flag parsing and treats remaining tokens as positional',
      'parseArgv(["run", "--", "-v", "--file", "main.js"])',
      '{"_":["run","-v","--file","main.js"]}'
    ),
    c(
      'Coerces boolean strings and negative numbers properly',
      'parseArgv(["--active=true", "--offset=-10", "item"])',
      '{"_":["item"],"active":true,"offset":-10}'
    ),
  ],

  'node-buffer-tlv-codec': [
    c(
      'Encodes and decodes a single TLV packet',
      'const packets = [{ type: 1, value: "Node.js" }];\nconst buf = encodeTLV(packets);\ndecodeTLV(buf)',
      '[{ type: 1, value: "Node.js" }]'
    ),
    c(
      'Encodes and decodes multiple packets preserving order and lengths',
      'const packets = [{ type: 10, value: "alpha" }, { type: 20, value: "beta" }, { type: 30, value: "gamma" }];\nconst buf = encodeTLV(packets);\ndecodeTLV(buf)',
      '[{ type: 10, value: "alpha" }, { type: 20, value: "beta" }, { type: 30, value: "gamma" }]'
    ),
    c(
      'Handles packets with empty payload value',
      'const packets = [{ type: 42, value: "" }];\nconst buf = encodeTLV(packets);\n[buf.byteLength, decodeTLV(buf)]',
      '[3, [{ type: 42, value: "" }]]'
    ),
    c(
      'Encodes and decodes empty packet array to 0-byte buffer',
      'const buf = encodeTLV([]);\n[buf.byteLength, decodeTLV(buf)]',
      '[0, []]'
    ),
    c(
      'Throws error when decoding truncated header or payload',
      'let caught = false;\ntry { decodeTLV(new Uint8Array([1, 0])); } catch { caught = true; }\ncaught',
      'true'
    ),
    c(
      'Correctly calculates byte length and decodes multi-byte UTF-8 characters',
      'const packets = [{ type: 99, value: "🚀 Node ⚡" }];\nconst buf = encodeTLV(packets);\ndecodeTLV(buf)[0].value',
      '"🚀 Node ⚡"'
    ),
  ],

  'node-querystring-parser': [
    c(
      'Parses standard key-value query string into object',
      'parseQuery("name=alice&role=admin&active=true")',
      '{ name: "alice", role: "admin", active: "true" }'
    ),
    c(
      'Strips leading ? and decodes plus signs and percent encodings',
      'parseQuery("?search=node+js&city=San%20Francisco")',
      '{ search: "node js", city: "San Francisco" }'
    ),
    c(
      'Aggregates repeated keys into arrays',
      'parseQuery("tag=react&tag=node&tag=typescript&single=val")',
      '{ tag: ["react", "node", "typescript"], single: "val" }'
    ),
    c(
      'Supports custom pair separator and assignment characters',
      'parseQuery("user:bob;role:dev;role:ops", ";", ":")',
      '{ user: "bob", role: ["dev", "ops"] }'
    ),
    c(
      'Treats keys without equals sign as empty string values',
      'parseQuery("flag&enabled=&key=value")',
      '{ flag: "", enabled: "", key: "value" }'
    ),
    c(
      'Stringifies objects with primitives and arrays',
      'stringifyQuery({ page: 1, filter: ["active", "verified"], debug: true })',
      '"page=1&filter=active&filter=verified&debug=true"'
    ),
    c(
      'Encodes special characters and omits null or undefined values',
      'stringifyQuery({ query: "hello world", missing: null, unused: undefined })',
      '"query=hello%20world"'
    ),
    c(
      'Stringifies with custom sep and eq delimiters',
      'stringifyQuery({ a: 1, b: 2 }, ";", ":")',
      '"a:1;b:2"'
    ),
  ],

  'node-env-parser-expander': [
    c(
      'Parses unquoted key-values and ignores comment lines and blank lines',
      'parseEnv("# Config\\nPORT=8080\\nHOST=localhost\\n# end")',
      '{ PORT: "8080", HOST: "localhost" }'
    ),
    c(
      'Strips export prefix and ignores inline comments on unquoted values',
      'parseEnv("export API_KEY=secret123 # dev key\\nexport DEBUG=true")',
      '{ API_KEY: "secret123", DEBUG: "true" }'
    ),
    c(
      'Unescapes escape sequences and expands variables in double quotes',
      'parseEnv("HOST=127.0.0.1\\nPORT=3000\\nURL=\\"http://$HOST:$PORT/api\\"\\nMSG=\\"line1\\\\nline2\\"")',
      '{ HOST: "127.0.0.1", PORT: "3000", URL: "http://127.0.0.1:3000/api", MSG: "line1\\nline2" }'
    ),
    c(
      'Preserves literal value without variable expansion in single quotes',
      'parseEnv("USER=alice\\nRAW=\x27$USER-$NOT_EXPANDED\x27")',
      '{ USER: "alice", RAW: "$USER-$NOT_EXPANDED" }'
    ),
    c(
      'Expands variable with fallback default when variable is missing',
      'parseEnv("APP_ENV=${ENV:-production}\\nPORT=${PORT:-8000}")',
      '{ APP_ENV: "production", PORT: "8000" }'
    ),
    c(
      'Expands references from provided baseEnv without returning baseEnv keys',
      'parseEnv("GREETING=\\"Hello, $NAME!\\"\\nENV=$APP_STAGE", { NAME: "World", APP_STAGE: "staging", UNTOUCHED: "extra" })',
      '{ GREETING: "Hello, World!", ENV: "staging" }'
    ),
  ],

  'node-stream-backpressure-pipe': [
    c(
      'Writes under watermark return true and track bufferedAmount',
      'const p = new BackpressurePipe({ highWaterMark: 3 });\n[p.write("a"), p.write("b"), p.bufferedAmount, p.isPaused]',
      '[true, true, 2, false]'
    ),
    c(
      'Write reaching watermark returns false and marks isPaused',
      'const p = new BackpressurePipe({ highWaterMark: 2 });\np.write(1);\nconst ok = p.write(2);\n[ok, p.isPaused, p.bufferedAmount]',
      '[false, true, 2]'
    ),
    c(
      'Reads dequeue in FIFO order',
      'const p = new BackpressurePipe({ highWaterMark: 4 });\np.write("first");\np.write("second");\n[p.read(), p.read(), p.read()]',
      '["first", "second", undefined]'
    ),
    c(
      'Fires drain event exactly when buffer completely empties after backpressure',
      'const p = new BackpressurePipe({ highWaterMark: 2 });\np.write(10);\np.write(20);\nlet drained = false;\np.on("drain", () => { drained = true; });\np.read();\nconst d1 = drained;\np.read();\n[d1, drained, p.isPaused]',
      '[false, true, false]'
    ),
    c(
      'Unregisters drain listener with off',
      'const p = new BackpressurePipe({ highWaterMark: 1 });\nlet count = 0;\nconst fn = () => count++;\np.on("drain", fn);\np.off("drain", fn);\np.write("x");\np.read();\ncount',
      '0'
    ),
  ],

  'node-ndjson-stream-splitter': [
    c(
      'Parses complete lines and keeps partial tail in remainder',
      'const s = new NDJSONSplitter();\nconst r = s.push(\'{"a":1}\\n{"b":2\');\n[r, s.remainder]',
      '[[{ a: 1 }], \'{"b":2\']'
    ),
    c(
      'Subsequent push completes line and processes multiple lines',
      'const s = new NDJSONSplitter();\ns.push(\'{"msg":"hel\');\nconst r = s.push(\'lo"}\\n{"msg":"world"}\\n\');\n[r, s.remainder]',
      '[[{ msg: "hello" }, { msg: "world" }], ""]'
    ),
    c(
      'Skips blank lines and whitespace',
      'const s = new NDJSONSplitter();\nconst r = s.push(\'\\n  \\n{"valid":true}\\n\\n\');\nr',
      '[{ valid: true }]'
    ),
    c(
      'Flush parses final non-newline-terminated JSON line and clears remainder',
      'const s = new NDJSONSplitter();\ns.push(\'{"final":42}\');\nconst flushed = s.flush();\n[flushed, s.remainder]',
      '[[{ final: 42 }], ""]'
    ),
    c(
      'Flush on empty buffer returns empty array',
      'const s = new NDJSONSplitter();\ns.flush()',
      '[]'
    ),
  ],

  'node-radix-trie-router': [
    c(
      'Matches static routes and ignores trailing slashes',
      'const r = new RadixRouter();\nr.add("GET", "/api/users", () => "users");\nconst m1 = r.find("GET", "/api/users");\nconst m2 = r.find("GET", "/api/users/");\n[m1.handler(), m2.handler()]',
      '["users", "users"]'
    ),
    c(
      'Matches single and multiple parameters',
      'const r = new RadixRouter();\nr.add("GET", "/orgs/:orgId/repos/:repoId", () => "repo");\nconst m = r.find("GET", "/orgs/acme/repos/core");\n[m.handler(), m.params]',
      '["repo", { orgId: "acme", repoId: "core" }]'
    ),
    c(
      'Priority: static over param',
      'const r = new RadixRouter();\nr.add("GET", "/users/me", () => "current-user");\nr.add("GET", "/users/:id", () => "any-user");\n[r.find("GET", "/users/me").handler(), r.find("GET", "/users/123").handler()]',
      '["current-user", "any-user"]'
    ),
    c(
      'Wildcard route captures remainder',
      'const r = new RadixRouter();\nr.add("GET", "/static/*path", () => "assets");\nconst m = r.find("GET", "/static/images/avatars/user.png");\n[m.handler(), m.params]',
      '["assets", { path: "images/avatars/user.png" }]'
    ),
    c(
      'Returns null on method or path mismatch',
      'const r = new RadixRouter();\nr.add("POST", "/submit", () => "ok");\n[r.find("GET", "/submit"), r.find("POST", "/other")]',
      '[null, null]'
    ),
  ],

  'node-http-accept-negotiator': [
    c(
      'Selects highest q factor',
      'negotiateAccept("text/html, application/json;q=0.9", ["application/json", "text/html"])',
      '"text/html"'
    ),
    c(
      'Respects explicit q weights',
      'negotiateAccept("application/xml;q=0.5, application/json;q=0.8", ["application/xml", "application/json"])',
      '"application/json"'
    ),
    c(
      'Wildcard subtype matching',
      'negotiateAccept("image/*;q=0.8, text/plain;q=0.5", ["text/plain", "image/png"])',
      '"image/png"'
    ),
    c(
      'Ties broken by specificity',
      'negotiateAccept("text/*, text/html", ["text/plain", "text/html"])',
      '"text/html"'
    ),
    c(
      'q=0 explicitly disallows type',
      'negotiateAccept("application/json;q=0", ["application/json"])',
      'null'
    ),
    c(
      'Null or empty accept header defaults to first available type',
      '[negotiateAccept(null, ["text/html", "application/json"]), negotiateAccept("", ["image/png"])]',
      '["text/html", "image/png"]'
    ),
    c(
      'No matching types returns null',
      'negotiateAccept("audio/mp3", ["video/mp4", "application/pdf"])',
      'null'
    ),
  ],
};
