interface TLVPacket {
  type: number;
  value: string;
}

function encodeTLV(packets: TLVPacket[]): Uint8Array {
  const encoder = new TextEncoder();
  const encoded = packets.map((p) => ({
    type: p.type,
    bytes: encoder.encode(p.value || ''),
  }));

  const totalLength = encoded.reduce((sum, p) => sum + 3 + p.bytes.length, 0);
  const out = new Uint8Array(totalLength);
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);

  let offset = 0;
  for (const { type, bytes } of encoded) {
    out[offset++] = type;
    view.setUint16(offset, bytes.length, false);
    offset += 2;
    out.set(bytes, offset);
    offset += bytes.length;
  }

  return out;
}

function decodeTLV(buffer: Uint8Array): TLVPacket[] {
  const decoder = new TextDecoder();
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const packets: TLVPacket[] = [];
  let offset = 0;

  while (offset < buffer.byteLength) {
    if (offset + 3 > buffer.byteLength) {
      throw new Error('Truncated TLV header');
    }
    const type = buffer[offset++];
    const length = view.getUint16(offset, false);
    offset += 2;

    if (offset + length > buffer.byteLength) {
      throw new Error('Truncated TLV payload');
    }

    const slice = buffer.subarray(offset, offset + length);
    packets.push({ type, value: decoder.decode(slice) });
    offset += length;
  }

  return packets;
}
