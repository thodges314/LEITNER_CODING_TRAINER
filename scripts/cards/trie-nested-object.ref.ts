type NestedTrie = {
  $?: boolean;
  [ch: string]: NestedTrie | boolean | undefined;
};

function buildTrie(words: string[]): NestedTrie {
  const root: NestedTrie = {};
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node[ch]) node[ch] = {};
      node = node[ch] as NestedTrie;
    }
    node.$ = true;
  }
  return root;
}

function walk(trie: NestedTrie, text: string): NestedTrie | null {
  let node: NestedTrie | null = trie;
  for (const ch of text) {
    if (!node || typeof node[ch] !== 'object' || node[ch] === null) return null;
    node = node[ch] as NestedTrie;
  }
  return node;
}

function hasWord(trie: NestedTrie, word: string): boolean {
  const node = walk(trie, word);
  return !!node && node.$ === true;
}

function hasPrefix(trie: NestedTrie, prefix: string): boolean {
  const node = walk(trie, prefix);
  return !!node && Object.keys(node).length > 0;
}
