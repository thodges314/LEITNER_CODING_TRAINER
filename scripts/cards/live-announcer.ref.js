const AnnouncerContext = createContext(null);

const hiddenStyle = {
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

function AnnouncerProvider({ children }) {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');

  const announce = useCallback((message, { politeness = 'polite' } = {}) => {
    // Same message again: toggle a trailing non-breaking space so the text really changes.
    const next = (prev) => (prev.trim() === message && !prev.endsWith('\u00a0') ? message + '\u00a0' : message);
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

function useAnnounce() {
  return useContext(AnnouncerContext);
}
