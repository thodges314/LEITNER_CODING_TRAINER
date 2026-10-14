function delegate(root, selector, eventType, handler) {
  const listener = (event) => {
    const start = event.target instanceof Element ? event.target : event.target.parentElement;
    const match = start && start.closest(selector); // nearest matching ancestor (or the target itself)
    if (match && match !== root && root.contains(match)) {
      handler.call(match, event, match);
    }
  };
  root.addEventListener(eventType, listener);
  return () => root.removeEventListener(eventType, listener);
}
