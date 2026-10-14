const TabsContext = createContext(null);

function Tabs({ children, defaultValue, value, onChange }) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const baseId = useId();

  const select = (next) => {
    if (!controlled) setInner(next);
    if (onChange) onChange(next);
  };

  return (
    <TabsContext.Provider value={{ current, select, baseId }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  const onKeyDown = (e) => {
    const tabs = [...e.currentTarget.querySelectorAll('[role="tab"]')];
    const i = tabs.indexOf(document.activeElement);
    if (i === -1) return;
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };
  return (
    <div role="tablist" onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}

function Tab({ value, children }) {
  const { current, select, baseId } = useContext(TabsContext);
  const selected = current === value;
  return (
    <button
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => select(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { current, baseId } = useContext(TabsContext);
  if (current !== value) return null;
  return (
    <div role="tabpanel" id={`${baseId}-panel-${value}`} aria-labelledby={`${baseId}-tab-${value}`}>
      {children}
    </div>
  );
}
