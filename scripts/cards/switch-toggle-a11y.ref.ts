function Switch({
  checked,
  onChange,
  disabled = false,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? 'true' : 'false'}
      disabled={disabled}
      onClick={(): void => onChange(!checked)}
    >
      {children}
    </button>
  );
}
