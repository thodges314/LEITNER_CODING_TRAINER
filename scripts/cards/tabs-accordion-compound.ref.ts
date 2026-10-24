interface TabsContextValue {
  current: string | undefined;
  select: (next: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  children?: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (next: string) => void;
}

function Tabs({ children, defaultValue, value, onChange }: TabsProps): JSX.Element {
  const [inner, setInner] = useState<string | undefined>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const baseId = useId();

  const select = (next: string): void => {
    if (!controlled) setInner(next);
    if (onChange) onChange(next);
  };

  return (
    <TabsContext.Provider value={{ current, select, baseId }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children?: React.ReactNode;
}

function TabList({ children }: TabListProps): JSX.Element {
  const onKeyDown = (e: unknown): void => {
    const ev = e as KeyboardEvent;
    const target = ev.currentTarget as HTMLElement;
    const tabs = [...target.querySelectorAll('[role="tab"]')] as HTMLElement[];
    const i = tabs.indexOf(document.activeElement as HTMLElement);
    if (i === -1) return;
    let next: HTMLElement | null = null;
    if (ev.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (ev.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (next) {
      ev.preventDefault();
      next.focus();
    }
  };
  return (
    <div role="tablist" onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children?: React.ReactNode;
}

function Tab({ value, children }: TabProps): JSX.Element {
  const ctx = useContext(TabsContext);
  const current = ctx?.current;
  const select = ctx?.select;
  const baseId = ctx?.baseId ?? '';
  const selected = current === value;
  return (
    <button
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => select && select(value)}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children?: React.ReactNode;
}

function TabPanel({ value, children }: TabPanelProps): JSX.Element | null {
  const ctx = useContext(TabsContext);
  const current = ctx?.current;
  const baseId = ctx?.baseId ?? '';
  if (current !== value) return null;
  return (
    <div role="tabpanel" id={`${baseId}-panel-${value}`} aria-labelledby={`${baseId}-tab-${value}`}>
      {children}
    </div>
  );
}
