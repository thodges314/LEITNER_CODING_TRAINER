interface SelectProps<T> {
  items: T[];
  value: T;
  onChange: (item: T) => void;
  getLabel: (item: T) => string;
}

function renderSelect<T>(props: SelectProps<T>): string {
  return props.items.map(item => props.getLabel(item)).join(', ');
}
