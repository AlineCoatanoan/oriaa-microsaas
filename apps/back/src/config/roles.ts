/** as const : une faute comme authorize('admn') est signalée dès VS Code. */
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type RoleLabel = (typeof ROLES)[keyof typeof ROLES];
