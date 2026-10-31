function simplifyPath(path: string): string {
  if (typeof path !== 'string' || !path.length) return '/';
  const parts: string[] = path.split('/');
  const stack: string[] = [];

  for (const part of parts) {
    if (!part || part === '.') {
      continue;
    }
    if (part === '..') {
      if (stack.length > 0) {
        stack.pop();
      }
    } else {
      stack.push(part);
    }
  }

  return '/' + stack.join('/');
}
