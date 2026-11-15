function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml) return '';

  const SAFE_ATTRS = new Set(['title', 'class']);
  const LINK_ATTRS = new Set(['href', 'target', 'rel']);

  const isSafeUrl = (raw) => {
    const normalized = raw.replace(/[\u0000-\u0020\u007f]+/g, '').toLowerCase();
    if (!normalized) return false;
    if (normalized.startsWith('/') || normalized.startsWith('#') || normalized.startsWith('?')) {
      return true;
    }
    const colonIdx = normalized.indexOf(':');
    const slashIdx = normalized.indexOf('/');
    if (colonIdx === -1 || (slashIdx !== -1 && slashIdx < colonIdx)) {
      return true;
    }
    return (
      normalized.startsWith('http:') ||
      normalized.startsWith('https:') ||
      normalized.startsWith('mailto:')
    );
  };

  const doc = new DOMParser().parseFromString(dirtyHtml, 'text/html');

  const sanitizeNode = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType !== 1) continue;

      const tag = child.tagName.toUpperCase();
      if (DROP_TAGS.has(tag)) {
        child.remove();
        continue;
      }

      sanitizeNode(child);

      if (!ALLOWED_TAGS.has(tag)) {
        const frag = doc.createDocumentFragment();
        while (child.firstChild) {
          frag.appendChild(child.firstChild);
        }
        child.replaceWith(frag);
        continue;
      }

      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || name === 'style') {
          child.removeAttribute(attr.name);
          continue;
        }
        if (tag === 'A' && LINK_ATTRS.has(name)) {
          if (name === 'href' && !isSafeUrl(attr.value)) {
            child.removeAttribute(attr.name);
          }
          continue;
        }
        if (!SAFE_ATTRS.has(name)) {
          child.removeAttribute(attr.name);
        }
      }

      if (tag === 'A' && child.getAttribute('target') === '_blank') {
        child.setAttribute('rel', 'noopener noreferrer');
      }
    }
  };

  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

