import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/** Calcule le hash d'un mot de passe. */
export const hashPassword = (password: string) =>
  bcrypt.hash(password, SALT_ROUNDS);

/** Compare un mot de passe saisi avec son hash. */
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);
