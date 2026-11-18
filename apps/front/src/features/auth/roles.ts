/** Mêmes valeurs que l'API. */
export const ROLES = { ADMIN: 'admin', USER: 'user' } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const roleLabels: Record<Role, string> = {
  admin: 'Administrateur',
  user: 'Utilisateur',
};

export const isAdmin = (user?: { role: Role } | null) =>
  user?.role === ROLES.ADMIN;
