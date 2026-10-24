function nextStep(step: number, total: number): number {
  return Math.min(step + 1, Math.max(0, total - 1));
}

function prevStep(step: number): number {
  return Math.max(step - 1, 0);
}

function stepStatuses(current: number, total: number): Array<'done' | 'current' | 'upcoming'> {
  return Array.from({ length: Math.max(0, total) }, (_, i) => (i < current ? 'done' : i === current ? 'current' : 'upcoming'));
}

function missingFields(values: Record<string, unknown>, required: string[]): string[] {
  return required.filter((name) => {
    const value = values[name];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });
}

function progressPercent(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((current / total) * 100);
}
