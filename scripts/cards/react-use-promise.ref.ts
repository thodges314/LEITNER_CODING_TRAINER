interface UserRecord {
  name: string;
  role: string;
}

interface UserProfileProps {
  userPromise: Promise<UserRecord>;
}

interface UserProfileContainerProps {
  userPromise: Promise<UserRecord>;
  fallback?: React.ReactNode;
}

function UserProfile({ userPromise }: UserProfileProps) {
  const user = React.use(userPromise);
  return (
    <div data-testid="user-card">
      <h3>{user.name}</h3>
      <p>{user.role}</p>
    </div>
  );
}

function UserProfileContainer({ userPromise, fallback }: UserProfileContainerProps) {
  return (
    <React.Suspense fallback={fallback ?? <p>Loading user...</p>}>
      <UserProfile userPromise={userPromise} />
    </React.Suspense>
  );
}

