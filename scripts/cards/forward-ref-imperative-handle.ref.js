const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current.focus(),
      clear: () => {
        inputRef.current.value = '';
        inputRef.current.focus();
      },
      getValue: () => inputRef.current.value,
    }),
    []
  );

  return <input ref={inputRef} {...props} />;
});
