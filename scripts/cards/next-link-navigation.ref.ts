interface NavItem {
  href: string;
  label: string;
}

interface NavigationBarProps {
  items: NavItem[];
  currentPath: string;
  onNavigate?: (href: string) => void;
}

function NavigationBar({
  items,
  currentPath,
  onNavigate,
}: NavigationBarProps): React.ReactElement {
  return (
    <nav data-testid="nav-bar" aria-label="Main Navigation">
      <ul className="nav-list">
        {items.map((item) => {
          const isActive = item.href === currentPath;
          return (
            <li key={item.href}>
              <a
                href={item.href}
                data-testid="nav-link"
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'nav-link active' : 'nav-link'}
                onClick={(e: MouseEvent) => {
                  e.preventDefault();
                  if (onNavigate) {
                    onNavigate(item.href);
                  }
                }}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
