interface RouteParams {
  orgId: string;
  memberId: string;
}

interface RouteContext {
  params: Promise<RouteParams>;
}

interface MemberRecord {
  id: string;
  orgId: string;
  role: 'owner' | 'admin' | 'member';
  email: string;
}

const membersStore = new Map<string, MemberRecord>();

async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  let resolvedParams: RouteParams | undefined;

  try {
    resolvedParams = await context.params;
  } catch {
    return NextResponse.json({ error: 'Invalid route parameters' }, { status: 400 });
  }

  const orgId = resolvedParams?.orgId;
  const memberId = resolvedParams?.memberId;

  if (
    typeof orgId !== 'string' ||
    orgId.trim().length === 0 ||
    typeof memberId !== 'string' ||
    memberId.trim().length === 0
  ) {
    return NextResponse.json({ error: 'Invalid route parameters' }, { status: 400 });
  }

  const key = `${orgId.trim()}::${memberId.trim()}`;
  const member = membersStore.get(key);

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  return NextResponse.json(member, { status: 200 });
}

