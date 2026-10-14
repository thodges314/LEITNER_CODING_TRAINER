function ToggleButton({ pressed, onPressedChange, children }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={() => onPressedChange(!pressed)}>
      {children}
    </button>
  );
}

function FormField({ label, hint, error, children }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && <p id={hintId}>{hint}</p>}
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
