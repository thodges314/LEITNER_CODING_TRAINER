interface ModuleLoader {
  require(id: string): any;
}

interface CjsModule {
  exports: any;
  loaded: boolean;
}

function resolveCjsPath(baseDir: string, target: string): string {
  if (!target.startsWith('.')) return target.startsWith('/') ? target : `/${target}`;
  const stack: string[] = [];
  `${baseDir}/${target}`.split('/').forEach((p) => {
    if (!p || p === '.') return;
    if (p === '..') stack.pop();
    else stack.push(p);
  });
  return `/${stack.join('/')}`;
}

function createModuleLoader(files: Record<string, string>): ModuleLoader {
  const cache: Record<string, CjsModule> = {};

  function req(id: string, currentDir = '/'): any {
    const raw = resolveCjsPath(currentDir, id);
    const path = files[raw] ? raw : files[`${raw}.js`] ? `${raw}.js` : files[`${raw}/index.js`] ? `${raw}/index.js` : null;
    if (!path) throw new Error(`Cannot find module "${id}"`);
    if (cache[path]) return cache[path].exports;

    const mod: CjsModule = { exports: {}, loaded: false };
    cache[path] = mod;
    const dirname = path.slice(0, Math.max(1, path.lastIndexOf('/')));
    const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', files[path]);
    fn(mod.exports, (relId: string) => req(relId, dirname), mod, path, dirname);
    mod.loaded = true;
    return mod.exports;
  }

  return { require: (id: string) => req(id, '/') };
}

