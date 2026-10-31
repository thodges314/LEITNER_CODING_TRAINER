class VirtualFS {
  root = { type: 'dir', children: {} };

  #nav(p) {
    let curr = this.root;
    for (const part of p.split('/').filter(Boolean)) {
      if (!curr?.children?.[part]) return null;
      curr = curr.children[part];
    }
    return curr;
  }

  mkdirp(dirPath) {
    let curr = this.root;
    for (const p of dirPath.split('/').filter(Boolean)) {
      curr = curr.children[p] ??= { type: 'dir', children: {} };
      if (curr.type !== 'dir') throw new Error(`ENOTDIR: ${p}`);
    }
  }

  writeFile(filePath, content) {
    const parts = filePath.split('/').filter(Boolean), name = parts.pop();
    const parent = this.#nav(parts.join('/'));
    if (!parent || parent.type !== 'dir') throw new Error('ENOENT');
    parent.children[name] = { type: 'file', content: String(content) };
  }

  readFile(filePath) {
    const node = this.#nav(filePath);
    if (!node) throw new Error('ENOENT');
    if (node.type === 'dir') throw new Error('EISDIR');
    return node.content;
  }

  readdir(dirPath) {
    const node = this.#nav(dirPath);
    if (!node) throw new Error('ENOENT');
    if (node.type !== 'dir') throw new Error('ENOTDIR');
    return Object.keys(node.children).sort();
  }

  stat(targetPath) {
    const node = this.#nav(targetPath);
    if (!node) throw new Error('ENOENT');
    return {
      isFile: () => node.type === 'file',
      isDirectory: () => node.type === 'dir',
      size: node.type === 'file' ? node.content.length : 0,
    };
  }

  rm(targetPath, options = {}) {
    const parts = targetPath.split('/').filter(Boolean), name = parts.pop();
    const parent = this.#nav(parts.join('/'));
    const node = parent?.children?.[name];
    if (!node) throw new Error('ENOENT');
    if (node.type === 'dir' && Object.keys(node.children).length && !options.recursive) {
      throw new Error('ENOTEMPTY');
    }
    delete parent.children[name];
  }
}
