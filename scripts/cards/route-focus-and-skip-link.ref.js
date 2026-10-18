function Layout({ path, title, children }) {
  const mainRef = useRef(null);
  const headingRef = useRef(null);
  const firstRender = useRef(true);

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
        onClick={(event) => {
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
