import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { resetDatabase } from '../helpers/database.js';
import { createUser, loginAgent, PASSWORD } from '../helpers/users.js';

const COLLEAGUE_EMAIL = 'collegue@oriaa.test';

const newUser = {
  lastName: 'Martin',
  firstName: 'Léa',
  email: 'lea.martin@oriaa.test',
  password: 'MotDePasseProvisoire1!',
  job: 'Éducatrice',
  role: 'user',
};

const loginStatus = async (email: string, password: string) =>
  (await request(app).post('/api/auth/login').send({ email, password })).status;

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/users', () => {
  it('liste uniquement les comptes actifs', async () => {
    const { agent, user } = await loginAgent();
    await createUser({
      email: COLLEAGUE_EMAIL,
      archivedAt: new Date(),
    });

    const response = await agent.get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0].id).toBe(user.user_id);
    expect(response.body.users[0]).not.toHaveProperty('password');
  });

  it('réserve les comptes archivés aux admins (403)', async () => {
    const { agent } = await loginAgent();

    const response = await agent.get('/api/users?archived=true');

    expect(response.status).toBe(403);
  });
});

describe('POST /api/users', () => {
  it('crée un compte utilisable, avec un mot de passe hashé (admin)', async () => {
    const { agent } = await loginAgent({ role: 'admin' });

    const response = await agent.post('/api/users').send(newUser);

    expect(response.status).toBe(201);
    const inDb = await prisma.user.findUnique({
      where: { email: newUser.email },
    });
    expect(inDb?.password).not.toBe(newUser.password);
    expect(await loginStatus(newUser.email, newUser.password)).toBe(200);
  });

  it("refuse la création à un utilisateur qui n'est pas admin (403)", async () => {
    const { agent } = await loginAgent();

    const response = await agent.post('/api/users').send(newUser);

    expect(response.status).toBe(403);
    expect(
      await prisma.user.findUnique({ where: { email: newUser.email } }),
    ).toBeNull();
  });
});

describe('Garde-fous sur son propre compte', () => {
  it('refuse de modifier son rôle, de s’archiver ou de se supprimer (409)', async () => {
    const { agent, user } = await loginAgent({ role: 'admin' });
    const url = `/api/users/${user.user_id}`;

    const role = await agent.patch(url).send({ role: 'user' });
    const archived = await agent.patch(`${url}/archive`);
    const deleted = await agent.delete(url);

    expect(role.status).toBe(409);
    expect(archived.status).toBe(409);
    expect(deleted.status).toBe(409);
  });
});

describe('PATCH /api/users/:id/archive', () => {
  it('coupe la connexion du compte archivé', async () => {
    const { agent } = await loginAgent({ role: 'admin' });
    const colleague = await createUser({ email: COLLEAGUE_EMAIL });

    const response = await agent.patch(
      `/api/users/${colleague.user_id}/archive`,
    );

    expect(response.status).toBe(200);
    expect(await loginStatus(COLLEAGUE_EMAIL, PASSWORD)).toBe(401);
  });
});

describe('DELETE /api/users/:id', () => {
  it("refuse de supprimer un compte qui n'est pas archivé (409)", async () => {
    const { agent } = await loginAgent({ role: 'admin' });
    const colleague = await createUser({ email: COLLEAGUE_EMAIL });

    const response = await agent.delete(`/api/users/${colleague.user_id}`);

    expect(response.status).toBe(409);
  });

  it('anonymise le compte et conserve ses notes', async () => {
    const { agent, user } = await loginAgent({ role: 'admin' });
    const colleague = await createUser({
      email: COLLEAGUE_EMAIL,
      archivedAt: new Date(),
    });
    const beneficiary = await prisma.beneficiary.create({
      data: {
        last_name: 'Durand',
        first_name: 'Lucas',
        entry_date: new Date('2026-10-01'),
        user_id: user.user_id,
      },
    });
    await prisma.note.create({
      data: {
        title: 'Entretien',
        beneficiary_id: beneficiary.beneficiary_id,
        user_id: colleague.user_id,
      },
    });

    const response = await agent.delete(`/api/users/${colleague.user_id}`);

    expect(response.status).toBe(204);
    const inDb = await prisma.user.findUnique({
      where: { user_id: colleague.user_id },
    });
    expect(inDb).toMatchObject({
      first_name: 'Utilisateur',
      last_name: 'supprimé',
      job: '',
    });
    expect(inDb?.email).not.toBe(COLLEAGUE_EMAIL);
    expect(inDb?.deleted_at).not.toBeNull();
    expect(await prisma.note.count()).toBe(1);
  });
});

describe('PATCH /api/auth/password', () => {
  it('change le mot de passe seulement si l’ancien est correct', async () => {
    const { agent, user } = await loginAgent();
    const newPassword = 'NouveauMotDePasse1!';

    const refused = await agent
      .patch('/api/auth/password')
      .send({ currentPassword: 'mauvais-mot-de-passe', newPassword });
    const accepted = await agent
      .patch('/api/auth/password')
      .send({ currentPassword: PASSWORD, newPassword });

    expect(refused.status).toBe(400);
    expect(accepted.status).toBe(204);
    expect(await loginStatus(user.email, newPassword)).toBe(200);
  });
});
