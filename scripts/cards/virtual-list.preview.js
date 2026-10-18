const virtualItems = Array.from({ length: 1000 }, (_, i) => `Row item #${i + 1}`);

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <VirtualList items={virtualItems} itemHeight={35} height={200} overscan={2} />
    </div>
  );
}

<Demo />
