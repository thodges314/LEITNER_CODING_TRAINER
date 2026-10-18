function watchForElements(root, selector, onFound, MO = MutationObserver) {
  const seen = new WeakSet();
  const report = (node) => {
    if (seen.has(node)) return;
    seen.add(node);
    onFound(node);
  };

  root.querySelectorAll(selector).forEach(report);

  const observer = new MO((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches(selector)) report(node);
        node.querySelectorAll(selector).forEach(report);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });

  return () => observer.disconnect();
}
