function useOnClickOutside(ref, handler) {
  const saved = useRef(handler);
  useEffect(() => {
    saved.current = handler; // always the newest handler, without re-subscribing
  });

  useEffect(() => {
    const listener = (event) => {
      const el = ref.current;
      if (!el || el.contains(event.target)) return;
      saved.current(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref]);
}
