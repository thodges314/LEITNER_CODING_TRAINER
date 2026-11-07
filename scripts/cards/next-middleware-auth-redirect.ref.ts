interface MiddlewareMatcherConfig {
  matcher: string[];
}

const middleware = (request: NextRequest): NextResponse => {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/dashboard')) {
    const authCookie = request.cookies.get('auth_token');
    const token = authCookie?.value;

    if (!token || token.trim().length === 0) {
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
};

