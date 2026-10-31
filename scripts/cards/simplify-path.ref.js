function simplifyPath(path) {
  if (typeof path !== 'string' || !path.length) return '/';
  const parts = path.split('/');
  const stack = [];

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
