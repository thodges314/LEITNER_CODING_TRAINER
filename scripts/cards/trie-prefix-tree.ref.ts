interface TrieNode {
  children: Record<string, TrieNode>;
  end: boolean;
}

class Trie {
  root: TrieNode;
  constructor() {
    this.root = { children: {}, end: false };
  }
  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = { children: {}, end: false };
      node = node.children[ch];
    }
    node.end = true;
  }
  private _find(prefix: string): TrieNode | null {
    let node: TrieNode | null = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node;
  }
  search(word: string): boolean {
    const node = this._find(word);
    return !!node && node.end;
  }
  startsWith(prefix: string): boolean {
    const node = this._find(prefix);
    if (!node) return false;
    return node.end || Object.keys(node.children).length > 0;
  }
  wordsWithPrefix(prefix: string): string[] {
    const start = this._find(prefix);
    const out: string[] = [];
    const walk = (node: TrieNode, path: string): void => {
      if (node.end) out.push(path);
      for (const ch of Object.keys(node.children).sort()) walk(node.children[ch], path + ch);
    };
    if (start) walk(start, prefix);
    return out;
  }
}
