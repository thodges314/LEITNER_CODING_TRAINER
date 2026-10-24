interface FocusableElement {
  focus(): void;
  [key: string]: unknown;
}

interface DocumentLike {
  activeElement: FocusableElement | null;
  [key: string]: unknown;
}

interface KeyEventLike {
  key: string;
  shiftKey?: boolean;
  preventDefault(): void;
}

function createFocusTrap(
  getFocusable: () => FocusableElement[],
  doc: DocumentLike,
): (event: KeyEventLike) => void {
  return function handleKeydown(event: KeyEventLike): void {
    if (event.key !== 'Tab') return;

    const items = getFocusable();
    if (items.length === 0) {
      event.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = doc.activeElement;
    const inside = active !== null && items.includes(active);

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
