function resolveCjsPath(baseDir, target) {
  let path = target;
  if (path.startsWith('./') || path.startsWith('../')) {
    const parts = `${baseDir}/${target}`.split('/');
    const stack = [];
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

function createModuleLoader(files) {
  const cache = {};

  function normalize(id, currentDir) {
    const resolved = resolveCjsPath(currentDir || '/', id);
    if (files[resolved]) return resolved;
    if (files[`${resolved}.js`]) return `${resolved}.js`;
    if (files[`${resolved}/index.js`]) return `${resolved}/index.js`;
    return null;
  }

  function req(id, currentDir = '/') {
    const absPath = normalize(id, currentDir);
    if (!absPath || !files[absPath]) {
      throw new Error(`Cannot find module "${id}"`);
    }

    if (cache[absPath]) {
      return cache[absPath].exports;
    }

    const mod = { exports: {}, loaded: false };
    cache[absPath] = mod;

    const lastSlash = absPath.lastIndexOf('/');
    const dirname = lastSlash <= 0 ? '/' : absPath.slice(0, lastSlash);

    const scopedRequire = (relId) => req(relId, dirname);

    const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', files[absPath]);
    fn(mod.exports, scopedRequire, mod, absPath, dirname);
    mod.loaded = true;

    return mod.exports;
  }

  return {
    require: (id) => req(id, '/'),
  };
}
