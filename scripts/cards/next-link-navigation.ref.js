'use client';

interface NavItem {
  href: string;
  label: string;
}

interface NavbarProps {
  items: NavItem[];
}

function Navbar({ items }: NavbarProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav aria-label="Main Navigation">
      <ul className="flex gap-4">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive ? 'text-blue-600 font-bold' : 'text-gray-600'}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
