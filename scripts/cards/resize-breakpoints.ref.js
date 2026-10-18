function observeBreakpoint(element, breakpoints, onChange, RO = ResizeObserver) {
  const sorted = Object.entries(breakpoints).sort((a, b) => a[1] - b[1]);
  const pick = (width) => {
    let name = null;
    for (const [candidate, min] of sorted) {
      if (width >= min) name = candidate;
    }
    return name;
  };

  let current; // undefined until the first measurement, so the first name (even null) always differs
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
