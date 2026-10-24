interface MediaQueryListLike {
  matches: boolean;
  addEventListener?(type: string, listener: (e: { matches: boolean }) => void): void;
  removeEventListener?(type: string, listener: (e: { matches: boolean }) => void): void;
  addListener?(listener: (e: { matches: boolean }) => void): void;
  removeListener?(listener: (e: { matches: boolean }) => void): void;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return Boolean(window.matchMedia(query).matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(query) as MediaQueryListLike;
    const handler = (e: { matches: boolean }): void => setMatches(Boolean(e.matches));

    setMatches(Boolean(mql.matches));

    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else if (mql.addListener) {
      mql.addListener(handler);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else if (mql.removeListener) {
        mql.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}
