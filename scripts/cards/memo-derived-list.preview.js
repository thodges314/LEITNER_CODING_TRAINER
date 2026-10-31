const defaultNumbers = [42, 7, 19, 3, 99, 14, 28];

function Demo() {
  const {
    items = defaultNumbers,
    onCompute,
  } = usePreviewProps({
    items: defaultNumbers,
  });

  const parsedItems = Array.isArray(items) && items.length > 0 ? items : defaultNumbers;

  return (
    <div style={{ padding: '16px' }}>
      <SortedList
        items={parsedItems}
        onCompute={() => {
          if (onCompute) onCompute();
          log('onCompute');
        }}
      />
    </div>
  );
}

<Demo />
