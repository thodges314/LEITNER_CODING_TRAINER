class IPCFramer {
  constructor() {
    this.buffer = new Uint8Array(0);
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  frame(payload) {
    const jsonStr = JSON.stringify(payload);
    const bytes = this.encoder.encode(jsonStr);
    const result = new Uint8Array(4 + bytes.length);
    const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
    view.setUint32(0, bytes.length, false);
    result.set(bytes, 4);
    return result;
  }

  push(chunk) {
    if (!chunk || chunk.byteLength === 0) return [];

    const merged = new Uint8Array(this.buffer.byteLength + chunk.byteLength);
    merged.set(this.buffer, 0);
    merged.set(chunk, this.buffer.byteLength);
    this.buffer = merged;

    const messages = [];
    let offset = 0;

    while (this.buffer.byteLength - offset >= 4) {
      const view = new DataView(this.buffer.buffer, this.buffer.byteOffset + offset, this.buffer.byteLength - offset);
      const payloadLen = view.getUint32(0, false);

      if (this.buffer.byteLength - offset < 4 + payloadLen) {
        break;
      }

      const payloadSlice = this.buffer.subarray(offset + 4, offset + 4 + payloadLen);
      const jsonStr = this.decoder.decode(payloadSlice);
      messages.push(JSON.parse(jsonStr));

      offset += 4 + payloadLen;
    }

    if (offset > 0) {
      this.buffer = this.buffer.subarray(offset);
    }

    return messages;
  }

  reset() {
    this.buffer = new Uint8Array(0);
  }
}
