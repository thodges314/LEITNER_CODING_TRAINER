function Breadcrumbs({ pathname, labels = {} }) {
  const clean = pathname ? pathname.replace(/\/+/g, '/').replace(/\/$/, '') : '';
  const segments = clean.split('/').filter(Boolean);

  const crumbs = [
    {
      path: '/',
      label: labels['/'] || 'Home',
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
      label: labels[currentPath] || defaultLabel,
      isCurrent,
    });
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        {crumbs.map((c) => (
          <li key={c.path} className={c.isCurrent ? 'breadcrumb-item active' : 'breadcrumb-item'}>
            {c.isCurrent ? (
              <span aria-current="page">{c.label}</span>
            ) : (
              <a href={c.path}>{c.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
