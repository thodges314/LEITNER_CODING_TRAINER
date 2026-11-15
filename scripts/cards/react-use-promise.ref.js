function UserProfile({ userPromise }) {
  const user = React.use(userPromise);
  return (
    <div data-testid="user-card">
      <h3>{user.name}</h3>
      <p>{user.role}</p>
    </div>
  );
}

function UserProfileContainer({ userPromise, fallback }) {
  return (
    <React.Suspense fallback={fallback ?? <p>Loading user...</p>}>
      <UserProfile userPromise={userPromise} />
    </React.Suspense>
  );
}

