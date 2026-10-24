interface BreadcrumbItem {
  path: string;
  label: string;
  isCurrent: boolean;
}

function generateBreadcrumbs(
  pathname: string,
  customLabels: Record<string, string> = {}
): BreadcrumbItem[] {
  const clean = pathname ? pathname.replace(/\/+/g, '/').replace(/\/$/, '') : '';
  const segments = clean.split('/').filter(Boolean);

  const crumbs: BreadcrumbItem[] = [
    {
      path: '/',
      label: customLabels['/'] || 'Home',
      isCurrent: segments.length === 0,
    },
  ];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += `/${seg}`;
    const isCurrent = i === segments.length - 1;
    const defaultLabel = seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({
      path: currentPath,
      label: customLabels[currentPath] || defaultLabel,
      isCurrent,
    });
  }

  return crumbs;
}

function Breadcrumbs({
  pathname,
  labels = {},
}: {
  pathname: string;
  labels?: Record<string, string>;
}): JSX.Element {
  const crumbs = generateBreadcrumbs(pathname, labels);

  return React.createElement(
    'nav',
    { 'aria-label': 'Breadcrumb' },
    React.createElement(
      'ol',
      { className: 'breadcrumbs' },
      crumbs.map((c) =>
        React.createElement(
          'li',
          { key: c.path, className: c.isCurrent ? 'breadcrumb-item active' : 'breadcrumb-item' },
          c.isCurrent
            ? React.createElement('span', { 'aria-current': 'page' }, c.label)
            : React.createElement('a', { href: c.path }, c.label)
        )
      )
    )
  );
}
