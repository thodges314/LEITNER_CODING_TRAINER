function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (this: any, ...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>): void {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
