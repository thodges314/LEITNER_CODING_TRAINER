function getOperationName(document: string): string | null {
  if (!document || typeof document !== 'string') return null;
  const cleaned = document.replace(/#[^\r\n]*/g, '');
  const match = cleaned.match(/(?:query|mutation|subscription)\s+([A-Za-z_][A-Za-z0-9_]*)/);
  return match ? match[1] : null;
}
