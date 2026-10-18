function Switch({ checked, onChange, disabled = false, children }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? 'true' : 'false'}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      {children}
    </button>
  );
}
