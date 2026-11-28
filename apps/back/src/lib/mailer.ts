import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/** Serveur d'envoi : Mailpit en développement, le SMTP de l'hébergeur en production. */
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  // Port 465 : connexion chiffrée dès le départ ; les autres passent en TLS ensuite
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
    : undefined,
});

type Mail = { to: string; subject: string; text: string };

/** Envoie un e-mail en texte brut : léger, lisible partout, sans image ni suivi. */
export async function sendMail(mail: Mail) {
  await transporter.sendMail({ from: env.MAIL_FROM, ...mail });
}
