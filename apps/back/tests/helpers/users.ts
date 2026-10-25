import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import type { RoleLabel } from '../../src/config/roles.js';

export const PASSWORD = 'MotDePasse123!';

/** Crée un rôle et un utilisateur de test. */
export async function createUser(
  options: { archivedAt?: Date; email?: string; role?: RoleLabel } = {},
) {
  const role = await prisma.role.create({
    data: { label: options.role ?? 'user' },
  });

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

/** Crée un utilisateur (rôle user par défaut) et renvoie un agent déjà connecté. */
export async function loginAgent(options: { role?: RoleLabel } = {}) {
  const user = await createUser({ role: options.role });
  const agent = request.agent(app);
  await agent
    .post('/api/auth/login')
    .send({ email: user.email, password: PASSWORD });
  return { agent, user };
}
