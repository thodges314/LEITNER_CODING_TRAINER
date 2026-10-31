function Demo() {
  const {
    page = 2,
    totalPages = 10,
    siblings = 1,
    onPageChange,
  } = usePreviewProps({
    page: 2,
    totalPages: 10,
    siblings: 1,
  });

  const [currentPage, setCurrentPage] = useState(page);
  useEffect(() => {
    setCurrentPage(Number(page) || 1);
  }, [page]);

  const handlePageChange = (p) => {
    setCurrentPage(p);
    if (onPageChange) onPageChange(p);
    log('onPageChange', p);
  };

  const parsedTotal = Math.max(1, Number(totalPages) || 10);
  const parsedSiblings = siblings !== undefined && siblings !== null && siblings !== '' ? Number(siblings) : 1;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
        Current page: <strong style={{ color: '#38bdf8' }}>{currentPage}</strong> of {parsedTotal}
      </div>
      <Pagination
        page={currentPage}
        totalPages={parsedTotal}
        siblings={parsedSiblings}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

<Demo />
