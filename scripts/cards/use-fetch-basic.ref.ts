interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T = unknown>(url: string): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchReturn<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    setState({ data: null, loading: true, error: null });
    fetch(url)
      .then((res: { ok: boolean; status: number; json: () => Promise<T> }) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: T) => setState({ data, loading: false, error: null }))
      .catch((error: Error) => setState({ data: null, loading: false, error }));
  }, [url]);

  return state;
}
