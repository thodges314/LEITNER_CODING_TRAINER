interface UseFetchReturn<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

function useFetch<T = unknown>(url: string): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchReturn<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(url, { signal: controller.signal })
      .then((res: { ok: boolean; status: number; json: () => Promise<T> }) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: T) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (cancelled || error.name === 'AbortError') return;
        setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  return state;
}
