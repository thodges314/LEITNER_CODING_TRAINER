function delegate(
  root: HTMLElement,
  selector: string,
  eventType: string,
  handler: (this: Element, event: Event, matchedElement: Element) => void,
): () => void {
  const listener = (event: Event): void => {
    const target = event.target as Element | (Node & { parentElement?: Element | null }) | null;
    const start: Element | null =
      target instanceof Element ? target : ((target?.parentElement as Element | null) ?? null);
    const match = start ? (start.closest(selector) as Element | null) : null;
    if (match && match !== root && root.contains(match)) {
      handler.call(match, event, match);
    }
  };
  root.addEventListener(eventType, listener);
  return () => root.removeEventListener(eventType, listener);
}
