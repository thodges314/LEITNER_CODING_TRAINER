async function copyToClipboard(text, env = {}) {
  const nav = 'navigator' in env ? env.navigator : typeof navigator !== 'undefined' ? navigator : undefined;
  const doc = 'document' in env ? env.document : typeof document !== 'undefined' ? document : undefined;

  if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
    try {
      await nav.clipboard.writeText(text);
      return true;
    } catch {
      // permission denied or insecure context: use the fallback below
    }
  }

  if (!doc) return false;
  const area = doc.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  doc.body.appendChild(area);
  try {
    area.select();
    return Boolean(doc.execCommand('copy'));
  } catch {
    return false;
  } finally {
    doc.body.removeChild(area);
  }
}
