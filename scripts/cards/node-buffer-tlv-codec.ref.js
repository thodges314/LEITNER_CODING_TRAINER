function encodeTLV(packets) {
  const enc = new TextEncoder();
  const items = packets.map((p) => ({ type: p.type, bytes: enc.encode(p.value || '') }));
  const out = new Uint8Array(items.reduce((s, p) => s + 3 + p.bytes.length, 0));
  const view = new DataView(out.buffer);
  let offset = 0;
  for (const { type, bytes } of items) {
    out[offset++] = type;
    view.setUint16(offset, bytes.length, false);
    offset += 2;
    out.set(bytes, offset);
    offset += bytes.length;
  }
  return out;
}

function decodeTLV(buffer) {
  const dec = new TextDecoder();
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const packets = [];
  let offset = 0;

  while (offset < buffer.byteLength) {
    if (offset + 3 > buffer.byteLength) throw new Error('Truncated TLV header');
    const type = buffer[offset++];
    const length = view.getUint16(offset, false);
    offset += 2;

    if (offset + length > buffer.byteLength) throw new Error('Truncated TLV payload');
    packets.push({ type, value: dec.decode(buffer.subarray(offset, offset + length)) });
    offset += length;
  }
  return packets;
}

