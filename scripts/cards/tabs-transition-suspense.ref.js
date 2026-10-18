const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
];

function Panel({ load, tab }) {
  const text = use(load(tab));
  return <p>{text}</p>;
}

function TabbedViewer({ load }) {
  const [tab, setTab] = useState('home');
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
