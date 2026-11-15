function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';

  const SAFE_ATTRS = new Set(['title', 'class']);
  const LINK_ATTRS = new Set(['href', 'target', 'rel']);

  const isSafeUrl = (raw: string): boolean => {
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

  const sanitizeNode = (node: Node): void => {
    const children = Array.from(node.childNodes) as Node[];
    for (const child of children) {
      if (child.nodeType !== 1) continue;
      const el = child as Element;
      const tag = el.tagName.toUpperCase();

      if (DROP_TAGS.has(tag)) {
        el.remove();
        continue;
      }

      sanitizeNode(el);

      if (!ALLOWED_TAGS.has(tag)) {
        const frag = doc.createDocumentFragment();
        while (el.firstChild) {
          frag.appendChild(el.firstChild);
        }
        el.replaceWith(frag);
        continue;
      }

      for (const attr of Array.from(el.attributes) as Array<{ name: string; value: string }>) {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || name === 'style') {
          el.removeAttribute(attr.name);
          continue;
        }
        if (tag === 'A' && LINK_ATTRS.has(name)) {
          if (name === 'href' && !isSafeUrl(attr.value)) {
            el.removeAttribute(attr.name);
          }
          continue;
        }
        if (!SAFE_ATTRS.has(name)) {
          el.removeAttribute(attr.name);
        }
      }

      if (tag === 'A' && el.getAttribute('target') === '_blank') {
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
  };

  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

