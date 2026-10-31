type IPCMessage = any;

class IPCFramer {
  private buffer = new Uint8Array(0);
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  frame(payload: IPCMessage): Uint8Array {
    const bytes = this.encoder.encode(JSON.stringify(payload));
    const result = new Uint8Array(4 + bytes.length);
    new DataView(result.buffer).setUint32(0, bytes.length, false);
    result.set(bytes, 4);
    return result;
  }

  push(chunk: Uint8Array): IPCMessage[] {
    if (!chunk || chunk.byteLength === 0) return [];
    const merged = new Uint8Array(this.buffer.length + chunk.length);
    merged.set(this.buffer);
    merged.set(chunk, this.buffer.length);
    this.buffer = merged;

    const messages: IPCMessage[] = [];
    let offset = 0;
    while (this.buffer.length - offset >= 4) {
      const len = new DataView(this.buffer.buffer, this.buffer.byteOffset + offset).getUint32(0, false);
      if (this.buffer.length - offset < 4 + len) break;
      messages.push(JSON.parse(this.decoder.decode(this.buffer.subarray(offset + 4, offset + 4 + len))));
      offset += 4 + len;
    }
    this.buffer = this.buffer.subarray(offset);
    return messages;
  }

  reset(): void { this.buffer = new Uint8Array(0); }
}

