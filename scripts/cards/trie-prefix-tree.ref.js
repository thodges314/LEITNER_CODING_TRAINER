class Trie {
  constructor() {
    this.root = { children: {}, end: false };
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = { children: {}, end: false };
      node = node.children[ch];
    }
    node.end = true;
  }
  _find(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      node = node.children[ch];
      if (!node) return null;
    }
    return node;
  }
  search(word) {
    const node = this._find(word);
    return !!node && node.end;
  }
  startsWith(prefix) {
    const node = this._find(prefix);
    if (!node) return false;
    return node.end || Object.keys(node.children).length > 0;
  }
  wordsWithPrefix(prefix) {
    const start = this._find(prefix);
    const out = [];
    const walk = (node, path) => {
      if (node.end) out.push(path);
      for (const ch of Object.keys(node.children).sort()) walk(node.children[ch], path + ch);
    };
    if (start) walk(start, prefix);
    return out;
  }
}
