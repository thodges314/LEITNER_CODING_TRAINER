interface TabItem {
  id: string;
  label: string;
  content: string;
}

interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
}

function Tabs({ tabs, defaultIndex = 0 }: TabsProps): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number>(defaultIndex);
  const activeTab = tabs[activeIndex];

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab: TabItem, index: number) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab && <div role="tabpanel">{activeTab.content}</div>}
    </div>
  );
}

