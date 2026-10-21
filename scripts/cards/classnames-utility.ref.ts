type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Record<string, any>
  | ClassValue[];

function classNames(...args: ClassValue[]): string {
  const out: string[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string' || typeof arg === 'number') {
      out.push(String(arg));
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner) out.push(inner);
    } else if (typeof arg === 'object') {
      for (const key of Object.keys(arg)) {
        if ((arg as Record<string, any>)[key]) out.push(key);
      }
    }
  }
  return out.join(' ');
}
