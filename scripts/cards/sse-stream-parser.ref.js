async function* parseSseStream(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let eventType = 'message';
  let dataLines = [];
  let eventId;
  let retryMs;

  const processLine = (line) => {
    if (line === '') {
      let dispatched = null;
      if (dataLines.length > 0) {
        dispatched = {
          event: eventType || 'message',
          data: dataLines.join('\n'),
        };
        if (eventId !== undefined) dispatched.id = eventId;
        if (retryMs !== undefined) dispatched.retry = retryMs;
      }
      eventType = 'message';
      dataLines = [];
      eventId = undefined;
      retryMs = undefined;
      return dispatched;
    }

    if (line.startsWith(':')) return null;

    const colonIndex = line.indexOf(':');
    const field = colonIndex === -1 ? line : line.slice(0, colonIndex);
    let value = colonIndex === -1 ? '' : line.slice(colonIndex + 1);
    if (value.startsWith(' ')) value = value.slice(1);

    if (field === 'data') {
      dataLines.push(value);
    } else if (field === 'event') {
      eventType = value;
    } else if (field === 'id') {
      if (!value.includes('\0')) eventId = value;
    } else if (field === 'retry') {
      if (/^\d+$/.test(value)) retryMs = Number(value);
    }

    return null;
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split(/\r\n|\r|\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const event = processLine(line);
        if (event) yield event;
      }
    }

    if (buffer.length > 0) {
      const event = processLine(buffer);
      if (event) yield event;
    }
  } finally {
    reader.releaseLock();
  }
}

