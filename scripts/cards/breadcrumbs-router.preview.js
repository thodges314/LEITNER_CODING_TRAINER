const breadcrumbLabels = {
  '/': 'Home',
  '/products': 'Catalog',
  '/products/electronics': 'Electronics',
  '/products/electronics/audio': 'Wireless Audio',
};

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <Breadcrumbs pathname="/products/electronics/audio" labels={breadcrumbLabels} />
    </div>
  );
}

<Demo />
