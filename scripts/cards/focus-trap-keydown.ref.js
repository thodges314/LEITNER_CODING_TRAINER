function createFocusTrap(getFocusable, doc) {
  return function handleKeydown(event) {
    if (event.key !== 'Tab') return;

    const items = getFocusable();
    if (items.length === 0) {
      event.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = doc.activeElement;
    const inside = items.includes(active);

    if (event.shiftKey) {
      if (active === first || !inside) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !inside) {
      event.preventDefault();
      first.focus();
    }
  };
}
