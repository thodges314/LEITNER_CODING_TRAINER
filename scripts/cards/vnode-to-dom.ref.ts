interface VNodeElement {
  type: string;
  props?: Record<string, unknown>;
  children?: VNodeChild[];
}

type VNodeChild = VNodeElement | string | number | boolean | null | undefined | VNodeChild[];
type VNode = VNodeChild;

function flattenChildren(children: VNodeChild[]): VNode[] {
  const out: VNode[] = [];
  for (const c of children) {
    if (Array.isArray(c)) {
      out.push(...flattenChildren(c));
    } else {
      out.push(c);
    }
  }
  return out;
}

function createDom(vnode: VNode): Node {
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') {
    return document.createTextNode('');
  }
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode)); // text nodes are never parsed as HTML
  }

  const el = document.createElement((vnode as VNodeElement).type);
  for (const [key, value] of Object.entries((vnode as VNodeElement).props || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'className') el.setAttribute('class', String(value));
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value as (evt: Event) => void);
    } else el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of flattenChildren((vnode as VNodeElement).children || [])) {
    if (child === null || child === undefined || typeof child === 'boolean') continue;
    el.appendChild(createDom(child));
  }
  return el;
}

function render(vnode: VNode, container: HTMLElement): void {
  container.replaceChildren(createDom(vnode));
}
