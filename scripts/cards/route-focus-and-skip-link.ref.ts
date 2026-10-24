function Layout({
  path,
  title,
  children,
}: {
  path: string;
  title: string;
  children?: React.ReactNode;
}): JSX.Element {
  const mainRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef<boolean>(true);

  useEffect(() => {
    document.title = `${title} | My App`;
  }, [title]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (headingRef.current) headingRef.current.focus();
  }, [path]);

  return (
    <>
      <a
        href="#main-content"
        onClick={(event: { preventDefault: () => void }): void => {
          event.preventDefault();
          if (mainRef.current) mainRef.current.focus();
        }}
      >
        Skip to main content
      </a>
      <main id="main-content" tabIndex={-1} ref={mainRef}>
        <h1 tabIndex={-1} ref={headingRef}>
          {title}
        </h1>
        {children}
      </main>
    </>
  );
}
