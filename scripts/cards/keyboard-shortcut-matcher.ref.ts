interface ParsedShortcut {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  mod: boolean;
}

interface KeyEventLike {
  key?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

const ALIASES: Record<string, string> = {
  control: 'ctrl',
  cmd: 'meta',
  command: 'meta',
  option: 'alt',
  esc: 'escape',
  return: 'enter',
  space: ' ',
};

function parseShortcut(text: string | ParsedShortcut): ParsedShortcut {
  if (typeof text === 'object' && text !== null) {
    return {
      key: text.key ?? '',
      ctrl: Boolean(text.ctrl),
      meta: Boolean(text.meta),
      alt: Boolean(text.alt),
      shift: Boolean(text.shift),
      mod: Boolean(text.mod),
    };
  }
  const out: ParsedShortcut = { key: '', ctrl: false, meta: false, alt: false, shift: false, mod: false };
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

function matchesShortcut(event: KeyEventLike, shortcut: string | ParsedShortcut, isMac = false): boolean {
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

function findShortcut(
  event: KeyEventLike,
  bindings: Record<string, string | ParsedShortcut>,
  isMac = false,
): string | null {
  for (const [name, shortcut] of Object.entries(bindings)) {
    if (matchesShortcut(event, shortcut, isMac)) return name;
  }
  return null;
}
