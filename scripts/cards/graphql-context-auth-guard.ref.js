function withAuth(resolver, requiredRoles = []) {
  return function authenticatedResolver(parent, args, context, info) {
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
