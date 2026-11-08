interface ServerUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientUserDTO {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: string;
  updatedAt: string;
}

interface SerializationResult {
  success: boolean;
  data?: ClientUserDTO;
  error?: string;
}

function serializeUserForClient(user: unknown): SerializationResult {
  if (typeof user !== 'object' || user === null) {
    return { success: false, error: 'Invalid user record' };
  }

  const u = user as Record<string, unknown>;
  const { id, name, email, role, createdAt, updatedAt } = u;

  if (
    typeof id !== 'string' || !id.trim() ||
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof role !== 'string' || !role.trim()
  ) {
    return { success: false, error: 'Missing required user fields' };
  }

  const isValidDate = (d: unknown): d is Date => d instanceof Date && !isNaN(d.getTime());
  if (!isValidDate(createdAt) || !isValidDate(updatedAt)) {
    return { success: false, error: 'Invalid date fields' };
  }

  return {
    success: true,
    data: {
      id: id.trim(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim() as 'admin' | 'user' | 'guest',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    },
  };
}
