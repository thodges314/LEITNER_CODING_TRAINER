function validateVariables(variableDefinitions, variables = {}) {
  const vars = variables ?? {};
  const missing = [];

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
