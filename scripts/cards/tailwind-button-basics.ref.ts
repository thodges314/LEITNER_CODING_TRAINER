type ButtonVariant = 'primary' | 'outline';

interface ButtonProps {
  variant?: ButtonVariant;
  disabled?: boolean;
  children?: any;
  onClick?: (event: any) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  [key: string]: any;
}

function Button({
  variant = 'primary',
  disabled = false,
  children,
  type = 'button',
  ...props
}: ButtonProps): React.ReactElement {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 active:scale-95 cursor-pointer';

  const variantClasses =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500';

  const disabledClasses = disabled
    ? 'disabled:opacity-50 disabled:pointer-events-none cursor-not-allowed'
    : '';

  const className = [baseClasses, variantClasses, disabledClasses, props.className]
    .filter(Boolean)
    .join(' ');

  return React.createElement(
    'button',
    {
      type,
      disabled,
      className,
      ...props,
    },
    children
  );
}

