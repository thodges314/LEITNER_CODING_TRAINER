interface LayoutProps {
  children: React.ReactNode;
}

interface TemplateProps {
  children: React.ReactNode;
}

interface DashboardRootProps {
  pathname: string;
  children: React.ReactNode;
}

function DashboardLayout({ children }: LayoutProps): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'dashboard-layout' },
    React.createElement('header', { 'data-testid': 'dashboard-header' }, 'Dashboard Shell'),
    React.createElement('main', null, children)
  );
}

function DashboardTemplate({ children }: TemplateProps): React.ReactElement {
  return React.createElement(
    'div',
    { 'data-testid': 'dashboard-template', className: 'template-enter' },
    children
  );
}

function DashboardRoot({ pathname, children }: DashboardRootProps): React.ReactElement {
  return React.createElement(
    DashboardLayout,
    null,
    React.createElement(DashboardTemplate, { key: pathname }, children)
  );
}
