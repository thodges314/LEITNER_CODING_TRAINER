function useOnClickOutside(
  ref: { current: HTMLElement | null },
  handler: (event: Event) => void,
): void {
  const saved = useRef<(event: Event) => void>(handler);
  useEffect(() => {
    saved.current = handler; // always the newest handler, without re-subscribing
  });

  useEffect(() => {
    const listener = (event: Event): void => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node | null)) return;
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
