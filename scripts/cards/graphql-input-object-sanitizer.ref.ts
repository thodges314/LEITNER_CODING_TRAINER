type ScalarType = 'String' | 'Int' | 'Float' | 'Boolean' | 'ID';

interface InputFieldSchema {
  type: ScalarType;
  required?: boolean;
  enumValues?: string[];
}

interface InputSchema {
  [fieldName: string]: InputFieldSchema;
}

interface SanitizedResult<T = any> {
  valid: boolean;
  data?: T;
  errors?: string[];
}

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
      if (field.required) {
        errors.push(`Field '${name}' is required`);
      }
      continue;
    }

    let typeValid = true;
    switch (field.type) {
      case 'String':
        typeValid = typeof val === 'string';
        break;
      case 'Int':
        typeValid = typeof val === 'number' && Number.isInteger(val);
        break;
      case 'Float':
        typeValid = typeof val === 'number' && Number.isFinite(val);
        break;
      case 'Boolean':
        typeValid = typeof val === 'boolean';
        break;
      case 'ID':
        typeValid = typeof val === 'string' || typeof val === 'number';
        break;
      default:
        typeValid = true;
    }

    if (!typeValid) {
      errors.push(`Field '${name}' must be of type ${field.type}`);
      continue;
    }

    if (Array.isArray(field.enumValues) && !field.enumValues.includes(val)) {
      errors.push(`Field '${name}' must be one of: ${field.enumValues.join(', ')}`);
      continue;
    }

    sanitized[name] = val;
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: sanitized as T };
}
