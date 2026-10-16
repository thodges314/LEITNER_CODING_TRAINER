function describe(value: string | number | string[]): string {
  if (typeof value === 'string') return 'string:' + value.length;
  if (typeof value === 'number') return 'number:' + value.toFixed(1);
  return 'list:' + value.length;
}

type Shape = { radius: number } | { width: number; height: number };

function area(shape: Shape): number {
  if ('radius' in shape) {
    return Math.round(Math.PI * shape.radius ** 2 * 100) / 100;
  }
  return shape.width * shape.height;
}
