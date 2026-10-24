interface AnnounceOptions {
  politeness?: 'polite' | 'assertive';
}

type AnnounceFn = (message: string, options?: AnnounceOptions) => void;

const AnnouncerContext = createContext<AnnounceFn | null>(null);

const hiddenStyle: Record<string, string | number> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

function AnnouncerProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [polite, setPolite] = useState<string>('');
  const [assertive, setAssertive] = useState<string>('');

  const announce = useCallback((message: string, { politeness = 'polite' }: AnnounceOptions = {}): void => {
    const next = (prev: string): string =>
      prev.trim() === message && !prev.endsWith('\u00a0') ? message + '\u00a0' : message;
    if (politeness === 'assertive') {
      setAssertive(next);
      setPolite('');
    } else {
      setPolite(next);
      setAssertive('');
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" style={hiddenStyle}>
        {polite}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" style={hiddenStyle}>
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  );
}

function useAnnounce(): AnnounceFn {
  return useContext(AnnouncerContext)!;
}
