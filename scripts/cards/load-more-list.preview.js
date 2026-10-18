async function fetchPage(page) {
  log('fetchPage')(page);
  return {
    items: [`Item ${(page - 1) * 3 + 1}`, `Item ${(page - 1) * 3 + 2}`, `Item ${(page - 1) * 3 + 3}`],
    hasMore: page < 3,
  };
}

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <LoadMoreList fetchPage={fetchPage} />
    </div>
  );
}

<Demo />
