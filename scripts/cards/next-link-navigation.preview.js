function Preview() {
  const props = usePreviewProps({
    items: [
      { href: '/', label: 'Overview' },
      { href: '/analytics', label: 'Analytics' },
      { href: '/settings', label: 'Settings' },
      { href: '/billing', label: 'Billing' },
    ],
  });

  return (
    <div className="p-6 bg-slate-900 min-h-[160px] flex items-center justify-center rounded-lg">
      <Navbar items={props.items} />
    </div>
  );
}

<Preview />

