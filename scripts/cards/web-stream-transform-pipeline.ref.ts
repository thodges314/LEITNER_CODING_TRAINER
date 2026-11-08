const createLineSanitizerTransform = (censorWords: string[]): TransformStream<string, string> => {
  let buffer = '';

  const sanitizeLine = (line: string): string => {
    let result = line;
    for (const word of censorWords) {
      if (!word) continue;
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      result = result.replace(regex, '[REDACTED]');
    }
    return result;
  };

  return new TransformStream<string, string>({
    transform(chunk, controller) {
      buffer += chunk;
      let newlineIndex: number;
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

const runStreamPipeline = async (
  chunks: string[],
  transform: TransformStream<string, string>
): Promise<string[]> => {
  const readable = new ReadableStream<string>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  const transformedStream = readable.pipeThrough(transform);
  const reader = transformedStream.getReader();
  const results: string[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value !== undefined) {
      results.push(value);
    }
  }

  return results;
};

