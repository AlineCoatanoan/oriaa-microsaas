import { createHash, randomBytes } from 'node:crypto';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';
import { BadRequestError } from '../errors/app-error.js';
import { sendMail } from '../lib/mailer.js';
import { hashPassword } from '../lib/password.js';
import { findActiveUser } from './auth.service.js';

/** Durée de validité du lien, en minutes. */
const RESET_LINK_MINUTES = 30;

const INVALID_LINK_MESSAGE =
  "Ce lien n'est plus valide. Faites une nouvelle demande de mot de passe oublié.";

/**
 * Seule l'empreinte du jeton est enregistrée : quelqu'un qui lirait
 * la base ne pourrait pas s'en servir pour changer un mot de passe.
 */
const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

/** Texte de l'e-mail envoyé avec le lien. */
function resetEmailText(firstName: string, link: string) {
  return `Bonjour ${firstName},

Vous avez demandé à réinitialiser votre mot de passe Oriaa.
Ouvrez ce lien pour en choisir un nouveau. Il est valable ${RESET_LINK_MINUTES} minutes et ne sert qu'une fois :

${link}

Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe actuel reste valable.

L'équipe Oriaa`;
}

/**
 * Envoie un lien de réinitialisation si l'adresse correspond à un compte actif.
 * Sinon, rien ne se passe et rien ne le signale (pas d'indice sur les comptes).
 */
export async function requestPasswordReset(email: string) {
  const user = await findActiveUser({ email });
  if (!user) return;

  // Jeton aléatoire, impossible à deviner ; une nouvelle demande remplace l'ancienne
  const token = randomBytes(32).toString('base64url');
  await prisma.user.update({
    where: { user_id: user.user_id },
    data: {
      password_reset_token_hash: hashToken(token),
      password_reset_expires_at: new Date(
        Date.now() + RESET_LINK_MINUTES * 60_000,
      ),
    },
  });

  const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  try {
    await sendMail({
      to: user.email,
      subject: 'Oriaa : réinitialisation de votre mot de passe',
      text: resetEmailText(user.first_name, link),
    });
  } catch (error) {
    // Serveur d'e-mails en panne : on le note pour l'équipe technique, mais la
    // réponse reste la même (une erreur révélerait que le compte existe)
    console.error('[mail] envoi du lien de réinitialisation impossible', error);
  }
}

/** Remplace le mot de passe si le lien est valide, puis l'invalide (usage unique). */
export async function resetPassword(token: string, password: string) {
  const user = await findActiveUser({
    password_reset_token_hash: hashToken(token),
    password_reset_expires_at: { gt: new Date() },
  });
  if (!user) throw new BadRequestError(INVALID_LINK_MESSAGE);

  await prisma.user.update({
    where: { user_id: user.user_id },
    data: {
      password: await hashPassword(password),
      password_reset_token_hash: null,
      password_reset_expires_at: null,
    },
  });
}
