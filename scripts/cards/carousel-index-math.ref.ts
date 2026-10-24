function nextIndex(index: number, length: number, { loop = true }: { loop?: boolean } = {}): number {
  if (length <= 0) return 0;
  if (index >= length - 1) return loop ? 0 : length - 1;
  return index + 1;
}

function prevIndex(index: number, length: number, { loop = true }: { loop?: boolean } = {}): number {
  if (length <= 0) return 0;
  if (index <= 0) return loop ? length - 1 : 0;
  return index - 1;
}

function dotStates(index: number, length: number): boolean[] {
  return Array.from({ length: Math.max(0, length) }, (_, i) => i === index);
}
