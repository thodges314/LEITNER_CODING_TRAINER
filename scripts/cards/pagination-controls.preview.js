function Demo() {
  const [currentPage, setCurrentPage] = useState(5);

  const handlePageChange = (p) => {
    setCurrentPage(p);
    log('onPageChange')(p);
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
        Current page: <strong style={{ color: '#38bdf8' }}>{currentPage}</strong> of 20
      </div>
      <Pagination page={currentPage} totalPages={20} onPageChange={handlePageChange} siblings={1} />
    </div>
  );
}

<Demo />
