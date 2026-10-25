async function defaultFetchPage(page) {
  log('fetchPage')(page);
  await new Promise((resolve) => setTimeout(resolve, 350));
  return {
    items: [`Item ${(page - 1) * 3 + 1}`, `Item ${(page - 1) * 3 + 2}`, `Item ${(page - 1) * 3 + 3}`],
    hasMore: page < 3,
  };
}

function Demo() {
  const { fetchPage = defaultFetchPage } = usePreviewProps({
    fetchPage: defaultFetchPage,
  });

  return (
    <div style={{ padding: '16px' }}>
      <LoadMoreList fetchPage={fetchPage} />
    </div>
  );
}

<Demo />
