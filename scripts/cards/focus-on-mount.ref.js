function FocusInput({ placeholder, label }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // only once: the dependency list is empty
  }, []);

  return (
    <label>
      {label}
      <input ref={inputRef} placeholder={placeholder} />
    </label>
  );
}
