interface LayoutProps {
  children: React.ReactNode;
}

interface TemplateProps {
  children: React.ReactNode;
}

interface RemountCoordinator {
  shouldRemountLayout(fromPath: string, toPath: string): boolean;
  shouldRemountTemplate(fromPath: string, toPath: string): boolean;
  getTemplateKey(pathname: string, visitCount: number): string;
}

const DashboardLayout = ({ children }: LayoutProps): React.ReactElement => {
  return (
    <div data-testid="dashboard-layout" className="dashboard-layout">
      {children}
    </div>
  );
};

const DashboardTemplate = ({ children }: TemplateProps): React.ReactElement => {
  return (
    <div data-testid="dashboard-template" className="dashboard-template">
      {children}
    </div>
  );
};

const createRemountCoordinator = (): RemountCoordinator => {
  const getLayoutRoot = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? `/${segments[0]}` : '/';
  };

  const shouldRemountLayout = (fromPath: string, toPath: string): boolean => {
    return getLayoutRoot(fromPath) !== getLayoutRoot(toPath);
  };

  const shouldRemountTemplate = (fromPath: string, toPath: string): boolean => {
    return fromPath !== toPath;
  };

  const getTemplateKey = (pathname: string, visitCount: number): string => {
    return `template-${pathname}-${visitCount}`;
  };

  return {
    shouldRemountLayout,
    shouldRemountTemplate,
    getTemplateKey,
  };
};

