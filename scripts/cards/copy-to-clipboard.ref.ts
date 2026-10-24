interface MockClipboard {
  writeText?: (text: string) => Promise<void>;
}

interface MockNavigator {
  clipboard?: MockClipboard;
}

interface MockElement {
  value?: string;
  style?: { position?: string; left?: string };
  setAttribute(name: string, value: string): void;
  select?(): void;
}

interface MockDocument {
  createElement(tag: string): MockElement;
  body: {
    appendChild(node: unknown): unknown;
    removeChild(node: unknown): unknown;
  };
  execCommand(cmd: string): boolean;
}

interface ClipboardEnv {
  navigator?: MockNavigator | null;
  document?: MockDocument | null;
}

async function copyToClipboard(text: string, env: ClipboardEnv = {}): Promise<boolean> {
  const nav: MockNavigator | undefined | null =
    'navigator' in env ? env.navigator : typeof navigator !== 'undefined' ? (navigator as MockNavigator) : undefined;
  const doc: MockDocument | undefined | null =
    'document' in env ? env.document : typeof document !== 'undefined' ? (document as MockDocument) : undefined;

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
  if (area.style) {
    area.style.position = 'fixed';
    area.style.left = '-9999px';
  }
  doc.body.appendChild(area);
  try {
    if (typeof area.select === 'function') {
      area.select();
    }
    return Boolean(doc.execCommand('copy'));
  } catch {
    return false;
  } finally {
    doc.body.removeChild(area);
  }
}
