interface MutationRecordLike {
  addedNodes: ArrayLike<Node>;
  [key: string]: unknown;
}

interface MutationObserverLike {
  observe(target: Node, options?: { childList?: boolean; subtree?: boolean; [key: string]: unknown }): void;
  disconnect(): void;
}

type MutationObserverConstructorLike = new (
  callback: (mutations: MutationRecordLike[], observer: MutationObserverLike) => void,
) => MutationObserverLike;

function watchForElements(
  root: Element,
  selector: string,
  onFound: (element: Element) => void,
  MO: MutationObserverConstructorLike = MutationObserver as unknown as MutationObserverConstructorLike,
): () => void {
  const seen = new WeakSet<Element>();
  const report = (node: Element): void => {
    if (seen.has(node)) return;
    seen.add(node);
    onFound(node);
  };

  root.querySelectorAll(selector).forEach(report);

  const observer = new MO((mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType !== 1) continue;
        const el = node as Element;
        if (el.matches(selector)) report(el);
        el.querySelectorAll(selector).forEach(report);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });

  return () => observer.disconnect();
}
