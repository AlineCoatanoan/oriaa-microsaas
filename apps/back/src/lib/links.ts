/** Enlève les doublons d'une liste d'identifiants. */
export const unique = (ids: number[]) => [...new Set(ids)];

/** Garde uniquement les identifiants absents de la liste actuelle. */
export const newIds = (ids: number[], current: number[]) =>
  ids.filter((id) => !current.includes(id));

export const toAssigneeLinks = (ids: number[]) =>
  ids.map((user_id) => ({ user_id }));

export const toBeneficiaryLinks = (ids: number[]) =>
  ids.map((beneficiary_id) => ({ beneficiary_id }));

export const toNoteLinks = (ids: number[]) =>
  ids.map((note_id) => ({ note_id }));

/** Pour Prisma : la liste envoyée remplace l'ancienne. */
export const replaceLinks = <T>(links: T[]) => ({
  deleteMany: {},
  create: links,
});
