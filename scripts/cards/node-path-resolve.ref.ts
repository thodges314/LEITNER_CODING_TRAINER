function resolvePath(...segments: string[]): string {
  let resolvedPath = '';
  let resolvedAbsolute = false;

  for (let i = segments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
    const path = segments[i];
    if (typeof path !== 'string' || path.length === 0) continue;

    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = path.charCodeAt(0) === 47 /* / */;
  }

  const parts = resolvedPath.split('/');
  const stack: string[] = [];

  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }

  const result = `/${stack.join('/')}`;
  return result;
}

function isSafePath(rootPath: string, userPath: string): boolean {
  const resolvedRoot = resolvePath(rootPath);
  const resolvedTarget = resolvePath(resolvedRoot, userPath);

  if (resolvedRoot === '/') return true;
  return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(`${resolvedRoot}/`);
}
