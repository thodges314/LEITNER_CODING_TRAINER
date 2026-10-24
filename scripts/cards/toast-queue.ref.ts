interface ToastItem {
  id: number;
  message: React.ReactNode;
}

interface ToastOptions {
  duration?: number;
}

interface ToastContextValue {
  show: (message: React.ReactNode, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

interface ToastProviderProps {
  children?: React.ReactNode;
  limit?: number;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastProvider({ children, limit = 3 }: ToastProviderProps): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef<number>(1);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number): void => {
    const timer = timers.current.get(id);
    if (timer !== undefined) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: React.ReactNode, { duration = 3000 }: ToastOptions = {}): number => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message }].slice(-limit));
      if (Number.isFinite(duration) && duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
      }
      return id;
    },
    [dismiss, limit]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo<ToastContextValue>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div role="region" aria-label="Notifications" className="toast-viewport">
        {toasts.map((toast) => (
          <div key={toast.id} role="status" className="toast-item">
            {toast.message}
            <button
              type="button"
              className="toast-dismiss"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast(): ToastContextValue {
  return useContext(ToastContext) as ToastContextValue;
}
