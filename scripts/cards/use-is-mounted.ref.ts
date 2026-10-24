function useIsMounted(): () => boolean {
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return React.useCallback(() => Boolean(isMountedRef.current), []);
}
