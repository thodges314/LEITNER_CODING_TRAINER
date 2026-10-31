interface GraphQLErrorLike {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    [key: string]: any;
  };
}

interface FormattedError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions: {
    code: string;
    [key: string]: any;
  };
}

const SAFE_CODES = new Set<string>([
  'BAD_USER_INPUT',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'GRAPHQL_VALIDATION_FAILED',
]);

function maskAndFormatError(
  error: GraphQLErrorLike,
  isProduction = true
): FormattedError {
  const code = error?.extensions?.code || 'INTERNAL_SERVER_ERROR';
  const isSafe = SAFE_CODES.has(code);

  if (isProduction && !isSafe) {
    const formatted: FormattedError = {
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

  const formatted: FormattedError = {
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
