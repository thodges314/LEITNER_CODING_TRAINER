function formatInput(value: string, toUpper: boolean): string;
function formatInput(value: number, precision: number): string;
function formatInput(value: string | number, option: boolean | number): string {
  if (typeof value === 'string') {
    return option ? value.toUpperCase() : value.toLowerCase();
  }
  return value.toFixed(option as number);
}

function assertNever(x: never, message?: string): never {
  throw new Error(message || `Unexpected value: ${x}`);
}

function isTagged<T extends { tag: string }, K extends string>(
  item: T,
  tag: K
): item is Extract<T, { tag: K }> {
  return item.tag === tag;
}
