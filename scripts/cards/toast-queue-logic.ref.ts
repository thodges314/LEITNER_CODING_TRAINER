interface Toast {
  id: string | number;
  message?: string;
  expiresAt?: number;
  [key: string]: unknown;
}

function addToast<T extends Toast>(toasts: T[], toast: T, max: number = 3): T[] {
  if (toasts.some((t) => t.id === toast.id)) {
    return toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t));
  }
  const next = [...toasts, toast];
  return next.length > max ? next.slice(next.length - max) : next;
}

function dismissToast<T extends Toast>(toasts: T[], id: string | number): T[] {
  return toasts.filter((t) => t.id !== id);
}

function expireToasts<T extends Toast>(toasts: T[], now: number): T[] {
  return toasts.filter((t) => t.expiresAt === undefined || t.expiresAt > now);
}
