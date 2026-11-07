interface BoundaryValidationError {
  path: string;
  type: string;
  message: string;
}

interface BoundaryValidationResult {
  valid: boolean;
  errors: BoundaryValidationError[];
  sanitizedProps?: Record<string, unknown>;
}

const validateClientBoundaryProps = (props: Record<string, unknown>): BoundaryValidationResult => {
  const errors: BoundaryValidationError[] = [];
  const seenObjects = new Set<unknown>();

  const traverse = (value: unknown, path: string): unknown => {
    if (value === null || value === undefined) {
      return value;
    }

    const valueType = typeof value;

    if (valueType === 'function') {
      errors.push({
        path,
        type: 'function',
        message: 'Functions cannot be passed across RSC client boundaries. Pass an identifier or Server Action reference instead.',
      });
      return undefined;
    }

    if (valueType === 'symbol') {
      errors.push({
        path,
        type: 'symbol',
        message: 'Symbols are not serializable across client boundaries.',
      });
      return undefined;
    }

    if (valueType === 'bigint') {
      errors.push({
        path,
        type: 'bigint',
        message: 'BigInt values cannot be serialized in RSC boundary props without custom formatting.',
      });
      return undefined;
    }

    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      if (seenObjects.has(value)) {
        errors.push({
          path,
          type: 'circular_reference',
          message: `Circular reference detected at ${path}.`,
        });
        return undefined;
      }
      seenObjects.add(value);

      if (Array.isArray(value)) {
        const sanitizedArray = value.map((item, index) =>
          traverse(item, path ? `${path}[${index}]` : `[${index}]`)
        );
        seenObjects.delete(value);
        return sanitizedArray;
      }

      const proto = Object.getPrototypeOf(value);
      const isPlain = proto === Object.prototype || proto === null;

      if (!isPlain) {
        const constructorName = (value as { constructor?: { name?: string } }).constructor?.name || 'Object';
        errors.push({
          path,
          type: 'class_instance',
          message: `Class instance ${constructorName} cannot be passed to Client Components. Convert to a plain object.`,
        });
        seenObjects.delete(value);
        return undefined;
      }

      const sanitizedObj: Record<string, unknown> = {};
      const record = value as Record<string, unknown>;
      for (const key of Object.keys(record)) {
        const childPath = path ? `${path}.${key}` : key;
        sanitizedObj[key] = traverse(record[key], childPath);
      }
      seenObjects.delete(value);
      return sanitizedObj;
    }

    return value;
  };

  const sanitized = traverse(props, '') as Record<string, unknown>;

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    errors: [],
    sanitizedProps: sanitized,
  };
};

