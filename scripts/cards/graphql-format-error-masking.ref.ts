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
  const shouldMask = isProduction && !isSafe;

  return {
    message: shouldMask ? 'Internal server error' : error?.message,
    ...(error?.locations ? { locations: error.locations } : {}),
    ...(error?.path ? { path: error.path } : {}),
    extensions: shouldMask ? { code: 'INTERNAL_SERVER_ERROR' } : { ...(error?.extensions || {}), code },
  };
}

