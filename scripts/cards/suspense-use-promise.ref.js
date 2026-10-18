function UserDetails({ userPromise }) {
  const user = use(userPromise);
  return (
    <p>
      {user.name} ({user.role})
    </p>
  );
}

function UserBadge({ userPromise }) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <UserDetails userPromise={userPromise} />
    </Suspense>
  );
}
