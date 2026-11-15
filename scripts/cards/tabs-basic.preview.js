function Demo() {
  const { tabs, defaultIndex = 0 } = usePreviewProps({
    tabs: [
      { id: 'overview', label: 'Overview', content: 'Summary of component props and usage.' },
      { id: 'api', label: 'API', content: 'Tabs accepts tabs[] and an optional defaultIndex.' },
      { id: 'examples', label: 'Examples', content: 'Switch tabs to view each panel.' },
    ],
    defaultIndex: 0,
  });

  const safeTabs = Array.isArray(tabs) ? tabs : [];

  return (
    <div style={{ padding: '16px' }}>
      <Tabs key={defaultIndex} tabs={safeTabs} defaultIndex={Number(defaultIndex) || 0} />
    </div>
  );
}

<Demo />

