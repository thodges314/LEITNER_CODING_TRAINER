type TabId = 'home' | 'posts' | 'about';

interface TabItem {
  id: TabId;
  label: string;
}

interface TabbedViewerProps {
  load: (tabId: TabId) => Promise<string>;
}

const TABS: readonly TabItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
];

function Panel({ load, tab }: { load: (tabId: TabId) => Promise<string>; tab: TabId }): JSX.Element {
  const text = use<string>(load(tab));
  return <p>{text}</p>;
}

function TabbedViewer({ load }: TabbedViewerProps): JSX.Element {
  const [tab, setTab] = useState<TabId>('home');
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => startTransition(() => setTab(t.id))}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-busy={isPending ? 'true' : 'false'}>
        <Suspense fallback={<p>Loading…</p>}>
          <Panel load={load} tab={tab} />
        </Suspense>
      </div>
    </div>
  );
}
