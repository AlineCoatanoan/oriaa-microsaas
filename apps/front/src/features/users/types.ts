import type { SessionUser } from '@/features/auth/useSession';

/** Compte utilisateur : mêmes informations que la session, plus l'archivage. */
export type User = SessionUser & {
  archivedAt: string | null;
};
