function safeParse(text, fallback) {
  if (typeof text !== 'string') return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function safeGet(storage, key, fallback) {
  return safeParse(storage.getItem(key), fallback);
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
