const createLineSanitizerTransform = (censorWords) => {
  let buffer = '';

  const sanitizeLine = (line) => {
    let result = line;
    for (const word of censorWords) {
      if (!word) continue;
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      result = result.replace(regex, '[REDACTED]');
    }
    return result;
  };

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk;
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        controller.enqueue(sanitizeLine(line));
      }
    },
    flush(controller) {
      if (buffer.length > 0) {
        controller.enqueue(sanitizeLine(buffer));
        buffer = '';
      }
    },
  });
};

const runStreamPipeline = async (chunks, transform) => {
  const readable = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  const transformedStream = readable.pipeThrough(transform);
  const reader = transformedStream.getReader();
  const results = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value !== undefined) {
      results.push(value);
    }
  }

  return results;
};
