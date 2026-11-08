interface LayoutProps {
  children: React.ReactNode;
}

interface TemplateProps {
  children: React.ReactNode;
  key?: string;
}

interface DashboardRootProps {
  pathname: string;
  children: React.ReactNode;
}

function DashboardLayout({ children }: LayoutProps): React.ReactElement {
  return (
    <div data-testid="dashboard-layout">
      <header data-testid="dashboard-header">Dashboard Shell</header>
      <main>{children}</main>
    </div>
  );
}

function DashboardTemplate({ children }: TemplateProps): React.ReactElement {
  return (
    <div data-testid="dashboard-template" className="template-enter">
      {children}
    </div>
  );
}

function DashboardRoot({ pathname, children }: DashboardRootProps): React.ReactElement {
  return (
    <DashboardLayout>
      <DashboardTemplate key={pathname}>{children}</DashboardTemplate>
    </DashboardLayout>
  );
}
