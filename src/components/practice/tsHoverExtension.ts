import { hoverTooltip } from '@codemirror/view';
import type { Tooltip, EditorView } from '@codemirror/view';

/**
 * Computes TypeScript QuickInfo hover tooltip for CodeMirror at the given position.
 */
export async function tsHoverTooltipSource(view: EditorView, pos: number): Promise<Tooltip | null> {
  const code = view.state.doc.toString();
  if (!code.trim() || pos < 0 || pos > code.length) return null;

  try {
    const { getTSQuickInfo } = await import('../../utils/typeChecker');
    const info = getTSQuickInfo(code, pos);
    if (!info || !info.signature) return null;

    return {
      pos: info.start,
      end: info.start + info.length,
      above: true,
      create() {
        const dom = document.createElement('div');
        dom.className = 'cm-ts-hover-card';

        const sig = document.createElement('div');
        sig.className = 'cm-ts-hover-sig';
        sig.textContent = info.signature;
        dom.appendChild(sig);

        if (info.documentation) {
          const doc = document.createElement('div');
          doc.className = 'cm-ts-hover-doc';
          doc.textContent = info.documentation;
          dom.appendChild(doc);
        }

        return { dom };
      },
    };
  } catch {
    return null;
  }
}

/**
 * Creates a CodeMirror 6 extension that provides rich TypeScript hover tooltips
 * (QuickInfo: type signatures, parameter documentation, ambient classes)
 * when practicing in TypeScript mode.
 *
 * Lazily loads the TypeScript language service on first hover so that initial
 * page load and JS mode remain ultra-fast with zero bundle overhead.
 */
export function createTsHoverExtension() {
  return hoverTooltip(tsHoverTooltipSource, { hideOnChange: true });
}
