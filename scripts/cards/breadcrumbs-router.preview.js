const defaultBreadcrumbLabels = {
  '/': 'Home',
  '/products': 'Catalog',
  '/products/electronics': 'Electronics',
  '/products/electronics/audio': 'Wireless Audio',
};

function Demo() {
  const {
    pathname = '/products/electronics/audio',
    labels = defaultBreadcrumbLabels,
  } = usePreviewProps({
    pathname: '/products/electronics/audio',
    labels: defaultBreadcrumbLabels,
  });

  return (
    <div style={{ padding: '16px' }}>
      <Breadcrumbs pathname={pathname || '/'} labels={labels || {}} />
    </div>
  );
}

<Demo />
