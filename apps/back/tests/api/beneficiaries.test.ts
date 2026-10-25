import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { resetDatabase } from '../helpers/database.js';
import { createUser, loginAgent } from '../helpers/users.js';

const validBeneficiary = {
  lastName: 'Martin',
  firstName: 'Lucas',
  entryDate: '2026-10-01',
  city: 'Rennes',
  numberOfChildren: 2,
};

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/beneficiaries', () => {
  it('crée un bénéficiaire avec la personne connectée comme référente', async () => {
    const { agent, user } = await loginAgent();

    const response = await agent
      .post('/api/beneficiaries')
      .send(validBeneficiary);

    expect(response.status).toBe(201);
    expect(response.body.beneficiary).toMatchObject({
      lastName: 'Martin',
      firstName: 'Lucas',
      city: 'Rennes',
      numberOfChildren: 2,
      entryDate: '2026-10-01',
      referentId: user.user_id,
    });
    // Il est bien enregistré en base
    expect(await prisma.beneficiary.count()).toBe(1);
  });

  it('refuse des données invalides', async () => {
    const { agent } = await loginAgent();

    const response = await agent
      .post('/api/beneficiaries')
      .send({ firstName: 'Lucas', entryDate: 'pas-une-date' });

    expect(response.status).toBe(400);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'lastName' }),
        expect.objectContaining({ field: 'entryDate' }),
      ]),
    );
  });

  it('refuse un référent inexistant', async () => {
    const { agent } = await loginAgent();

    const response = await agent
      .post('/api/beneficiaries')
      .send({ ...validBeneficiary, referentId: 9999 });

    expect(response.status).toBe(400);
    expect(await prisma.beneficiary.count()).toBe(0);
  });

  it('refuse une requête sans être connecté', async () => {
    const response = await request(app)
      .post('/api/beneficiaries')
      .send(validBeneficiary);

    expect(response.status).toBe(401);
  });
});

describe('GET /api/beneficiaries/:id', () => {
  it('renvoie le bénéficiaire demandé', async () => {
    const { agent } = await loginAgent();
    const created = await agent
      .post('/api/beneficiaries')
      .send(validBeneficiary);

    const response = await agent.get(
      `/api/beneficiaries/${created.body.beneficiary.id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.beneficiary.lastName).toBe('Martin');
  });

  it("renvoie 404 si le bénéficiaire n'existe pas", async () => {
    const { agent } = await loginAgent();

    const response = await agent.get('/api/beneficiaries/9999');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

/** Crée directement un bénéficiaire en base (plus rapide que par l'API). */
async function createBeneficiary(
  userId: number,
  data: { lastName: string; firstName?: string; archivedAt?: Date },
) {
  return prisma.beneficiary.create({
    data: {
      last_name: data.lastName,
      first_name: data.firstName ?? 'Test',
      entry_date: new Date('2026-10-01'),
      archived_at: data.archivedAt,
      user_id: userId,
    },
  });
}

describe('GET /api/beneficiaries', () => {
  it('liste les bénéficiaires actifs, triés par nom puis prénom', async () => {
    const { agent, user } = await loginAgent();
    await createBeneficiary(user.user_id, {
      lastName: 'Martin',
      firstName: 'Lucas',
    });
    await createBeneficiary(user.user_id, {
      lastName: 'Bernard',
      firstName: 'Sarah',
    });
    await createBeneficiary(user.user_id, {
      lastName: 'Bernard',
      firstName: 'Anna',
    });
    await createBeneficiary(user.user_id, {
      lastName: 'Archivé',
      archivedAt: new Date(),
    });

    const response = await agent.get('/api/beneficiaries');

    expect(response.status).toBe(200);
    const names = response.body.beneficiaries.map(
      (b: { lastName: string; firstName: string }) =>
        `${b.lastName} ${b.firstName}`,
    );
    expect(names).toEqual(['Bernard Anna', 'Bernard Sarah', 'Martin Lucas']);
  });

  it('liste uniquement les archivés avec ?archived=true', async () => {
    const { agent, user } = await loginAgent();
    await createBeneficiary(user.user_id, { lastName: 'Martin' });
    await createBeneficiary(user.user_id, {
      lastName: 'Archivé',
      archivedAt: new Date(),
    });

    const response = await agent.get('/api/beneficiaries?archived=true');

    expect(response.status).toBe(200);
    expect(response.body.beneficiaries).toHaveLength(1);
    expect(response.body.beneficiaries[0].lastName).toBe('Archivé');
  });

  it("inclut les bénéficiaires suivis par d'autres référents", async () => {
    const { agent } = await loginAgent();
    const colleague = await createUser({ email: 'collegue@oriaa.test' });
    await createBeneficiary(colleague.user_id, { lastName: 'Durand' });

    const response = await agent.get('/api/beneficiaries');

    expect(response.status).toBe(200);
    expect(response.body.beneficiaries).toHaveLength(1);
    expect(response.body.beneficiaries[0].referentId).toBe(colleague.user_id);
  });

  it('refuse un filtre invalide', async () => {
    const { agent } = await loginAgent();

    const response = await agent.get('/api/beneficiaries?archived=abc');

    expect(response.status).toBe(400);
  });
});
