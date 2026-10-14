function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled || error.name === 'AbortError') return;
        setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true; // never set state from a stale response
      controller.abort();
    };
  }, [url]);

  return state;
}
