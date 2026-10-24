import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { resetDatabase } from '../helpers/database.js';

const PASSWORD = 'MotDePasse123!';

/** Crée un rôle et un utilisateur de test. */
async function createUser(options: { archivedAt?: Date } = {}) {
  const role = await prisma.role.create({ data: { label: 'user' } });

  return prisma.user.create({
    data: {
      last_name: 'Dupont',
      first_name: 'Marie',
      email: 'marie.dupont@oriaa.test',
      password: await bcrypt.hash(PASSWORD, 10),
      job: 'Travailleuse sociale',
      role_id: role.role_id,
      archived_at: options.archivedAt,
    },
  });
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  it("connecte l'utilisateur et dépose le cookie", async () => {
    await createUser();

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marie.dupont@oriaa.test', password: PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      email: 'marie.dupont@oriaa.test',
      role: 'user',
    });
    expect(response.body.user).not.toHaveProperty('password');

    const cookie = response.headers['set-cookie']?.[0] ?? '';
    expect(cookie).toContain('oriaa_token=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('refuse un mauvais mot de passe', async () => {
    await createUser();

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marie.dupont@oriaa.test', password: 'mauvais' });

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe(
      'Email ou mot de passe incorrect.',
    );
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('refuse un email inconnu avec le même message', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@oriaa.test', password: PASSWORD });

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe(
      'Email ou mot de passe incorrect.',
    );
  });

  it('refuse un compte archivé', async () => {
    await createUser({ archivedAt: new Date() });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marie.dupont@oriaa.test', password: PASSWORD });

    expect(response.status).toBe(401);
  });

  it('refuse des données invalides', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pas-un-email' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });
});
