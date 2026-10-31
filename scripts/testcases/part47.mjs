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
};
