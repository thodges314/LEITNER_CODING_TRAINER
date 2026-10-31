class VirtualFS {
  constructor() {
    this.root = { type: 'dir', children: {} };
  }

  _parsePath(p) {
    return p.split('/').filter(Boolean);
  }

  _traverse(parts) {
    let curr = this.root;
    for (const part of parts) {
      if (!curr || curr.type !== 'dir' || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  }

  mkdirp(dirPath) {
    const parts = this._parsePath(dirPath);
    let curr = this.root;
    for (const part of parts) {
      if (!curr.children[part]) {
        curr.children[part] = { type: 'dir', children: {} };
      } else if (curr.children[part].type !== 'dir') {
        throw new Error(`ENOTDIR: not a directory, ${part}`);
      }
      curr = curr.children[part];
    }
  }

  writeFile(filePath, content) {
    const parts = this._parsePath(filePath);
    if (parts.length === 0) throw new Error('Invalid path');
    const fileName = parts.pop();
    const parent = this._traverse(parts);
    if (!parent || parent.type !== 'dir') {
      throw new Error('ENOENT: no such file or directory');
    }
    parent.children[fileName] = { type: 'file', content: String(content) };
  }

  readFile(filePath) {
    const parts = this._parsePath(filePath);
    const node = this._traverse(parts);
    if (!node) throw new Error('ENOENT: no such file or directory');
    if (node.type === 'dir') throw new Error('EISDIR: illegal operation on a directory');
    return node.content;
  }

  readdir(dirPath) {
    const parts = this._parsePath(dirPath);
    const node = this._traverse(parts);
    if (!node) throw new Error('ENOENT: no such file or directory');
    if (node.type !== 'dir') throw new Error('ENOTDIR: not a directory');
    return Object.keys(node.children).sort();
  }

  stat(targetPath) {
    const parts = this._parsePath(targetPath);
    const node = this._traverse(parts);
    if (!node) throw new Error('ENOENT: no such file or directory');
    return {
      isFile: () => node.type === 'file',
      isDirectory: () => node.type === 'dir',
      size: node.type === 'file' ? node.content.length : 0,
    };
  }

  rm(targetPath, options = {}) {
    const parts = this._parsePath(targetPath);
    if (parts.length === 0) throw new Error('Cannot remove root');
    const name = parts.pop();
    const parent = this._traverse(parts);
    if (!parent || !parent.children[name]) {
      throw new Error('ENOENT: no such file or directory');
    }
    const node = parent.children[name];
    if (node.type === 'dir' && Object.keys(node.children).length > 0 && !options.recursive) {
      throw new Error('ENOTEMPTY: directory not empty');
    }
    delete parent.children[name];
  }
}
