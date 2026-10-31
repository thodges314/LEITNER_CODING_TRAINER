const SAFE_CODES = new Set([
  'BAD_USER_INPUT',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'GRAPHQL_VALIDATION_FAILED',
]);

function maskAndFormatError(error, isProduction = true) {
  const code = error?.extensions?.code || 'INTERNAL_SERVER_ERROR';
  const isSafe = SAFE_CODES.has(code);

  if (isProduction && !isSafe) {
    const formatted = {
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    };
    if (error?.locations) {
      formatted.locations = error.locations;
    }
    if (error?.path) {
      formatted.path = error.path;
    }
    return formatted;
  }

  const formatted = {
    message: error?.message,
    extensions: {
      ...(error?.extensions || {}),
      code,
    },
  };
  if (error?.locations) {
    formatted.locations = error.locations;
  }
  if (error?.path) {
    formatted.path = error.path;
  }
  return formatted;
}
