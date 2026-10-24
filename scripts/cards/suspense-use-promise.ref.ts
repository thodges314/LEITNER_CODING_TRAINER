interface User {
  name: string;
  role: string;
}

interface UserBadgeProps {
  userPromise: Promise<User>;
}

function UserDetails({ userPromise }: UserBadgeProps): JSX.Element {
  const user = use<User>(userPromise);
  return (
    <p>
      {user.name} ({user.role})
    </p>
  );
}

function UserBadge({ userPromise }: UserBadgeProps): JSX.Element {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <UserDetails userPromise={userPromise} />
    </Suspense>
  );
}
