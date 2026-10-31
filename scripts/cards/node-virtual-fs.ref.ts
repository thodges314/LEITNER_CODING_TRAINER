class VirtualFS {
  root: any = { type: 'dir', children: {} };

  #nav(p: string): any {
    let curr: any = this.root;
    for (const part of p.split('/').filter(Boolean)) {
      if (!curr?.children?.[part]) return null;
      curr = curr.children[part];
    }
    return curr;
  }

  mkdirp(dirPath: string): void {
    let curr = this.root;
    for (const p of dirPath.split('/').filter(Boolean)) {
      curr = curr.children[p] ??= { type: 'dir', children: {} };
      if (curr.type !== 'dir') throw new Error(`ENOTDIR: ${p}`);
    }
  }

  writeFile(filePath: string, content: string): void {
    const parts = filePath.split('/').filter(Boolean), name = parts.pop()!;
    const parent = this.#nav(parts.join('/'));
    if (!parent || parent.type !== 'dir') throw new Error('ENOENT');
    parent.children[name] = { type: 'file', content: String(content) };
  }

  readFile(filePath: string): string {
    const node = this.#nav(filePath);
    if (!node) throw new Error('ENOENT');
    if (node.type === 'dir') throw new Error('EISDIR');
    return node.content;
  }

  readdir(dirPath: string): string[] {
    const node = this.#nav(dirPath);
    if (!node) throw new Error('ENOENT');
    if (node.type !== 'dir') throw new Error('ENOTDIR');
    return Object.keys(node.children).sort();
  }

  stat(targetPath: string): VirtualFSStat {
    const node = this.#nav(targetPath);
    if (!node) throw new Error('ENOENT');
    return {
      isFile: () => node.type === 'file',
      isDirectory: () => node.type === 'dir',
      size: node.type === 'file' ? node.content.length : 0,
    };
  }

  rm(targetPath: string, options: VirtualFSOptions = {}): void {
    const parts = targetPath.split('/').filter(Boolean), name = parts.pop()!;
    const parent = this.#nav(parts.join('/'));
    const node = parent?.children?.[name];
    if (!node) throw new Error('ENOENT');
    if (node.type === 'dir' && Object.keys(node.children).length && !options.recursive) {
      throw new Error('ENOTEMPTY');
    }
    delete parent.children[name];
  }
}
