function createDom(vnode) {
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') {
    return document.createTextNode('');
  }
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode)); // text nodes are never parsed as HTML
  }

  const el = document.createElement(vnode.type);
  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'className') el.setAttribute('class', value);
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of (vnode.children || []).flat(Infinity)) {
    if (child === null || child === undefined || typeof child === 'boolean') continue;
    el.appendChild(createDom(child));
  }
  return el;
}

function render(vnode, container) {
  container.replaceChildren(createDom(vnode));
}
