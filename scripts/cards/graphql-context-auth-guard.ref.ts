type GraphQLResolver<TSource = any, TArgs = any, TContext = any, TResult = any> = (
  parent: TSource,
  args: TArgs,
  context: TContext,
  info: any
) => TResult;

interface UserPayload {
  id: string;
  roles?: string[];
}

interface AuthContext {
  user?: UserPayload | null;
  [key: string]: any;
}

function withAuth<TSource = any, TArgs = any, TResult = any>(
  resolver: GraphQLResolver<TSource, TArgs, AuthContext, TResult>,
  requiredRoles: string[] = []
): GraphQLResolver<TSource, TArgs, AuthContext, TResult> {
  return function authenticatedResolver(parent: TSource, args: TArgs, context: AuthContext, info: any): TResult {
    const user = context?.user;
    if (!user) {
      throw new Error('UNAUTHENTICATED');
    }

    if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
      const userRoles = Array.isArray(user.roles) ? user.roles : [];
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        throw new Error('FORBIDDEN');
      }
    }

    return resolver(parent, args, context, info);
  };
}
