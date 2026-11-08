interface RootLayoutProps {
  children: React.ReactNode;
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className} data-testid="root-body">
        {children}
      </body>
    </html>
  );
}
