class NDJSONSplitter {
  constructor() {
    this.buffer = '';
  }

  push(chunk) {
    if (!chunk || typeof chunk !== 'string') return [];
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop();

    const parsed = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      parsed.push(JSON.parse(line));
    }
    return parsed;
  }

  flush() {
    const tail = this.buffer.trim();
    this.buffer = '';
    if (!tail) return [];
    return [JSON.parse(tail)];
  }

  get remainder() {
    return this.buffer;
  }
}
