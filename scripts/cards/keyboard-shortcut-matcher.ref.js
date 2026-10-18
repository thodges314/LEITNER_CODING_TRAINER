const ALIASES = { control: 'ctrl', cmd: 'meta', command: 'meta', option: 'alt', esc: 'escape', return: 'enter', space: ' ' };

function parseShortcut(text) {
  const out = { key: '', ctrl: false, meta: false, alt: false, shift: false, mod: false };
  for (const raw of String(text).split('+')) {
    const lower = raw.trim().toLowerCase();
    if (!lower) continue;
    const part = ALIASES[lower] ?? lower;
    if (part === 'ctrl' || part === 'meta' || part === 'alt' || part === 'shift' || part === 'mod') {
      out[part] = true;
    } else if (part) {
      out.key = part;
    }
  }
  return out;
}

function matchesShortcut(event, shortcut, isMac = false) {
  const s = parseShortcut(shortcut);
  const wantCtrl = s.ctrl || (s.mod && !isMac);
  const wantMeta = s.meta || (s.mod && isMac);
  return (
    String(event.key).toLowerCase() === s.key &&
    Boolean(event.ctrlKey) === wantCtrl &&
    Boolean(event.metaKey) === wantMeta &&
    Boolean(event.altKey) === s.alt &&
    Boolean(event.shiftKey) === s.shift
  );
}

function findShortcut(event, bindings, isMac = false) {
  for (const [name, shortcut] of Object.entries(bindings)) {
    if (matchesShortcut(event, shortcut, isMac)) return name;
  }
  return null;
}
