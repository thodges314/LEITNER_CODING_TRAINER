function buildTrie(words) {
  const root = {};
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node.$ = true;
  }
  return root;
}

function walk(trie, text) {
  let node = trie;
  for (const ch of text) {
    node = node[ch];
    if (!node) return null;
  }
  return node;
}

function hasWord(trie, word) {
  const node = walk(trie, word);
  return !!node && node.$ === true;
}

function hasPrefix(trie, prefix) {
  const node = walk(trie, prefix);
  return !!node && Object.keys(node).length > 0;
}
