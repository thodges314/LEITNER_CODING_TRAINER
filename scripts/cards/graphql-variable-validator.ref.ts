interface VariableValidationResult {
  valid: boolean;
  missing: string[];
}

function validateVariables(
  variableDefinitions: Record<string, string>,
  variables?: Record<string, any> | null
): VariableValidationResult {
  const vars = variables ?? {};
  const missing: string[] = [];

  for (const [name, typeDef] of Object.entries(variableDefinitions || {})) {
    if (typeof typeDef === 'string' && typeDef.trim().endsWith('!')) {
      const val = vars[name];
      if (val === undefined || val === null) {
        missing.push(name);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
