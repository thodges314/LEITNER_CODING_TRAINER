interface ModuleLoader {
  require(id: string): any;
}

interface CjsModule {
  exports: any;
  loaded: boolean;
}

function resolveCjsPath(baseDir: string, target: string): string {
  let path = target;
  if (path.startsWith('./') || path.startsWith('../')) {
    const parts = `${baseDir}/${target}`.split('/');
    const stack: string[] = [];
    for (const p of parts) {
      if (!p || p === '.') continue;
      if (p === '..') {
        if (stack.length > 0) stack.pop();
      } else {
        stack.push(p);
      }
    }
    path = `/${stack.join('/')}`;
  } else if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return path;
}

function createModuleLoader(files: Record<string, string>): ModuleLoader {
  const cache: Record<string, CjsModule> = {};

  function normalize(id: string, currentDir: string): string | null {
    const resolved = resolveCjsPath(currentDir || '/', id);
    if (files[resolved]) return resolved;
    if (files[`${resolved}.js`]) return `${resolved}.js`;
    if (files[`${resolved}/index.js`]) return `${resolved}/index.js`;
    return null;
  }

  function req(id: string, currentDir: string = '/'): any {
    const absPath = normalize(id, currentDir);
    if (!absPath || !files[absPath]) {
      throw new Error(`Cannot find module "${id}"`);
    }

    if (cache[absPath]) {
      return cache[absPath].exports;
    }

    const mod: CjsModule = { exports: {}, loaded: false };
    cache[absPath] = mod;

    const lastSlash = absPath.lastIndexOf('/');
    const dirname = lastSlash <= 0 ? '/' : absPath.slice(0, lastSlash);

    const scopedRequire = (relId: string) => req(relId, dirname);

    const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', files[absPath]);
    fn(mod.exports, scopedRequire, mod, absPath, dirname);
    mod.loaded = true;

    return mod.exports;
  }

  return {
    require: (id: string) => req(id, '/'),
  };
}
