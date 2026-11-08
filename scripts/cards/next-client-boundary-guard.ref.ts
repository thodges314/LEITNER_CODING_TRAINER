interface ServerUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordHash: string;
  apiSecret: string;
  createdAt: Date;
}

type ClientSafeUser = Omit<ServerUserRecord, 'passwordHash' | 'apiSecret'>;

interface UserProfileContainerProps {
  userId: string;
  fetchUser: (id: string) => Promise<ServerUserRecord | null>;
}

const UserProfileContainer = async ({
  userId,
  fetchUser,
}: UserProfileContainerProps): Promise<React.ReactElement> => {
  const user = await fetchUser(userId);
  if (!user) {
    notFound();
  }

  const { passwordHash, apiSecret, ...clientSafeUser } = user;

  return (
    <div data-testid="user-profile-boundary">
      <UserBadge user={clientSafeUser} />
    </div>
  );
};
