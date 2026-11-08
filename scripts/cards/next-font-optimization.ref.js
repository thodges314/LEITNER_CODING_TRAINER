interface RootLayoutProps {
  children: React.ReactNode;
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return React.createElement(
    'html',
    { lang: 'en', className: inter.variable },
    React.createElement('body', { className: inter.className, 'data-testid': 'root-body' }, children)
  );
}

