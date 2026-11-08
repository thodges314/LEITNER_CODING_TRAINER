function delay(ms: number): Promise<void> {
  const duration = typeof ms === 'number' && ms > 0 ? ms : 0;
  return new Promise<void>((resolve) => setTimeout(resolve, duration));
}

function delayValue<T>(value: T, ms: number): Promise<T> {
  const duration = typeof ms === 'number' && ms > 0 ? ms : 0;
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), duration));
}

