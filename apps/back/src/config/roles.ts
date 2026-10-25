export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type RoleLabel = (typeof ROLES)[keyof typeof ROLES];

//Grâce à as const, TypeScript connaît les valeurs exactes.
// Si on écrit authorize('admn'), l’erreur apparaît dans VS Code avant même de lancer le code.//
