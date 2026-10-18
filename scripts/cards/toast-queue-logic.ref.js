function addToast(toasts, toast, max = 3) {
  if (toasts.some((t) => t.id === toast.id)) {
    return toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t));
  }
  const next = [...toasts, toast];
  return next.length > max ? next.slice(next.length - max) : next;
}

function dismissToast(toasts, id) {
  return toasts.filter((t) => t.id !== id);
}

function expireToasts(toasts, now) {
  return toasts.filter((t) => t.expiresAt === undefined || t.expiresAt > now);
}
