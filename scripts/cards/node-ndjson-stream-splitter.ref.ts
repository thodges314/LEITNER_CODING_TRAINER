type JsonRecord = any;

class NDJSONSplitter {
  private buffer: string;

  constructor() {
    this.buffer = '';
  }

  push(chunk: string): JsonRecord[] {
    if (!chunk || typeof chunk !== 'string') return [];
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    const parsed: JsonRecord[] = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      parsed.push(JSON.parse(line));
    }
    return parsed;
  }

  flush(): JsonRecord[] {
    const tail = this.buffer.trim();
    this.buffer = '';
    if (!tail) return [];
    return [JSON.parse(tail)];
  }

  get remainder(): string {
    return this.buffer;
  }
}
