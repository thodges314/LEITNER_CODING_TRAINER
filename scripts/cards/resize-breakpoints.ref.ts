interface ResizeObserverEntryLike {
  contentRect: { width: number; [key: string]: unknown };
  [key: string]: unknown;
}

interface ResizeObserverLike {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

type ResizeObserverConstructorLike = new (
  callback: (entries: ResizeObserverEntryLike[], observer: ResizeObserverLike) => void,
) => ResizeObserverLike;

function observeBreakpoint(
  element: Element,
  breakpoints: Record<string, number>,
  onChange: (name: string | null) => void,
  RO: ResizeObserverConstructorLike = ResizeObserver as unknown as ResizeObserverConstructorLike,
): () => void {
  const sorted = Object.entries(breakpoints).sort((a, b) => a[1] - b[1]);
  const pick = (width: number): string | null => {
    let name: string | null = null;
    for (const [candidate, min] of sorted) {
      if (width >= min) name = candidate;
    }
    return name;
  };

  let current: string | null | undefined; // undefined until the first measurement
  const observer = new RO((entries) => {
    for (const entry of entries) {
      const name = pick(entry.contentRect.width);
      if (name !== current) {
        current = name;
        onChange(name);
      }
    }
  });
  observer.observe(element);

  return () => observer.disconnect();
}
