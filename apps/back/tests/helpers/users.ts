import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';

export const PASSWORD = 'MotDePasse123!';

/** Crée un rôle et un utilisateur de test. */
export async function createUser(
  options: { archivedAt?: Date; email?: string } = {},
) {
  const role = await prisma.role.create({ data: { label: 'user' } });

  return prisma.user.create({
    data: {
      last_name: 'Dupont',
      first_name: 'Marie',
      email: options.email ?? 'marie.dupont@oriaa.test',
      password: await bcrypt.hash(PASSWORD, 10),
      job: 'Travailleuse sociale',
      role_id: role.role_id,
      archived_at: options.archivedAt,
    },
  });
}

/** Crée un utilisateur et renvoie un agent déjà connecté (il garde le cookie). */
export async function loginAgent() {
  const user = await createUser();
  const agent = request.agent(app);
  await agent
    .post('/api/auth/login')
    .send({ email: user.email, password: PASSWORD });
  return { agent, user };
}
