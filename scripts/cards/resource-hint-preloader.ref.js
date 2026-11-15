function preloadResources(resources, targetHead = document.head) {
  const existingKeys = new Set();
  for (const link of targetHead.querySelectorAll('link[rel][href]')) {
    existingKeys.add(`${link.getAttribute('rel')}::${link.getAttribute('href')}`);
  }

  const created = [];

  for (const hint of resources) {
    if (!hint || !hint.href) continue;
    const rel = hint.rel ?? 'preload';
    const key = `${rel}::${hint.href}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);

    const link = document.createElement('link');
    link.rel = rel;
    link.setAttribute('href', hint.href);

    if (hint.as) {
      link.as = hint.as;
      link.setAttribute('as', hint.as);
    }

    if (hint.fetchPriority) {
      link.setAttribute('fetchpriority', hint.fetchPriority);
    }

    if (hint.crossOrigin !== undefined) {
      link.crossOrigin = hint.crossOrigin;
    } else if (hint.as === 'font') {
      link.crossOrigin = 'anonymous';
    }

    targetHead.appendChild(link);
    created.push(link);
  }

  return created;
}

