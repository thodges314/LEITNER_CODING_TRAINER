const SCALAR_CHECKS: Record<string, (v: any) => boolean> = {
  String: (v) => typeof v === 'string',
  Int: (v) => typeof v === 'number' && Number.isInteger(v),
  Float: (v) => typeof v === 'number' && Number.isFinite(v),
  Boolean: (v) => typeof v === 'boolean',
  ID: (v) => typeof v === 'string' || typeof v === 'number',
};

function sanitizeInput<T = any>(
  schema: InputSchema,
  input: Record<string, any>
): SanitizedResult<T> {
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};
  const data = input || {};

  for (const [name, field] of Object.entries(schema || {})) {
    const val = data[name];

    if (val === undefined || val === null) {
      if (field.required) errors.push(`Field '${name}' is required`);
      continue;
    }

    const checker = SCALAR_CHECKS[field.type];
    if (checker && !checker(val)) {
      errors.push(`Field '${name}' must be of type ${field.type}`);
      continue;
    }

    if (Array.isArray(field.enumValues) && !field.enumValues.includes(val)) {
      errors.push(`Field '${name}' must be one of: ${field.enumValues.join(', ')}`);
      continue;
    }

    sanitized[name] = val;
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, data: sanitized as T };
}

