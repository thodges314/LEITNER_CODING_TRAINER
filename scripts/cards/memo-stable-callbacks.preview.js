const defaultItems = ['Alpha', 'Beta', 'Gamma', 'Delta'];

function Demo() {
  const {
    items = defaultItems,
    onListRender,
  } = usePreviewProps({
    items: defaultItems,
  });

  const parsedItems = Array.isArray(items) && items.length > 0 ? items : defaultItems;

  return (
    <div style={{ padding: '16px' }}>
      <Parent
        items={parsedItems}
        onListRender={() => {
          if (onListRender) onListRender();
          log('onListRender');
        }}
      />
    </div>
  );
}

<Demo />
