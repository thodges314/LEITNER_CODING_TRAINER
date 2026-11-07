function createDomQueries() {
  function getRole(el) {
    if (!el || el.nodeType !== 1) return null;
    const explicit = el.getAttribute('role');
    if (explicit) return explicit.trim().toLowerCase();

    const tag = el.tagName.toLowerCase();
    if (tag === 'button') return 'button';
    if (tag === 'a' && el.hasAttribute('href')) return 'link';
    if (/^h[1-6]$/.test(tag)) return 'heading';
    if (tag === 'nav') return 'navigation';
    if (tag === 'main') return 'main';
    if (tag === 'dialog') return 'dialog';
    if (tag === 'select') return 'combobox';
    if (tag === 'textarea') return 'textbox';
    if (tag === 'input') {
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      if (type === 'button' || type === 'submit' || type === 'reset') return 'button';
      return 'textbox';
    }
    return null;
  }

  function getAccessibleName(el) {
    if (!el) return '';
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();

    if (el.id) {
      const label = el.ownerDocument?.querySelector(`label[for="${el.id}"]`);
      if (label && label.textContent) return label.textContent.trim();
    }

    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel !== el) {
      const clone = parentLabel.cloneNode(true);
      const inputs = clone.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => input.remove());
      if (clone.textContent?.trim()) return clone.textContent.trim();
    }

    return (el.textContent || '').trim();
  }

  function matchesName(actualName, expectedName) {
    if (!expectedName) return true;
    if (expectedName instanceof RegExp) {
      return expectedName.test(actualName);
    }
    return actualName.toLowerCase() === String(expectedName).toLowerCase().trim();
  }

  function getByRole(container, role, options = {}) {
    const el = queryByRole(container, role, options);
    if (!el) {
      throw new Error(`Unable to find an accessible element with the role "${role}"`);
    }
    return el;
  }

  function queryByRole(container, role, options = {}) {
    if (!container) return null;
    const all = Array.from(container.querySelectorAll('*'));
    if (container.nodeType === 1) all.unshift(container);

    const targetRole = role.toLowerCase();
    const matched = all.filter((el) => {
      if (getRole(el) !== targetRole) return false;
      if (options.name !== undefined) {
        return matchesName(getAccessibleName(el), options.name);
      }
      return true;
    });

    if (matched.length > 1) {
      throw new Error(`Found multiple elements with the role "${role}"`);
    }
    return matched[0] || null;
  }

  function getByText(container, textOrRegex) {
    const el = queryByText(container, textOrRegex);
    if (!el) {
      throw new Error(`Unable to find an element with text: ${textOrRegex}`);
    }
    return el;
  }

  function queryByText(container, textOrRegex) {
    if (!container) return null;
    const all = Array.from(container.querySelectorAll('*'));

    const isMatch = (text) => {
      const trimmed = text.trim();
      if (textOrRegex instanceof RegExp) {
        return textOrRegex.test(trimmed);
      }
      return trimmed.toLowerCase() === String(textOrRegex).toLowerCase().trim();
    };

    // Find all matching elements, preferring lowest leaves
    const matched = all.filter((el) => {
      // Must match direct text or immediate text
      const hasDirectMatch = Array.from(el.childNodes).some(
        (node) => node.nodeType === 3 && isMatch(node.nodeValue || '')
      );
      return hasDirectMatch || isMatch(el.textContent || '');
    });

    // Pick elements that don't have descendants also in matched (deepest leaves)
    const leaves = matched.filter(
      (el) => !matched.some((other) => other !== el && el.contains(other))
    );

    if (leaves.length > 1) {
      throw new Error(`Found multiple elements with text: ${textOrRegex}`);
    }
    return leaves[0] || null;
  }

  return {
    getByRole,
    queryByRole,
    getByText,
    queryByText,
  };
}

