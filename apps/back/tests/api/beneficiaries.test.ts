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

describe('PATCH /api/beneficiaries/:id', () => {
  it('modifie uniquement les champs envoyés', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id, {
      lastName: 'Martin',
      firstName: 'Lucas',
    });

    const response = await agent
      .patch(`/api/beneficiaries/${beneficiary.beneficiary_id}`)
      .send({ city: 'Brest' });

    expect(response.status).toBe(200);
    expect(response.body.beneficiary).toMatchObject({
      city: 'Brest',
      lastName: 'Martin', // inchangé
      firstName: 'Lucas', // inchangé
    });
  });

  it('vide un champ facultatif envoyé à null', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id, {
      lastName: 'Martin',
    });
    await prisma.beneficiary.update({
      where: { beneficiary_id: beneficiary.beneficiary_id },
      data: { phone: '0601020304' },
    });

    const response = await agent
      .patch(`/api/beneficiaries/${beneficiary.beneficiary_id}`)
      .send({ phone: null });

    expect(response.status).toBe(200);
    expect(response.body.beneficiary.phone).toBeNull();
  });

  it('change de référent', async () => {
    const { agent, user } = await loginAgent();
    const colleague = await createUser({ email: 'collegue@oriaa.test' });
    const beneficiary = await createBeneficiary(user.user_id, {
      lastName: 'Martin',
    });

    const response = await agent
      .patch(`/api/beneficiaries/${beneficiary.beneficiary_id}`)
      .send({ referentId: colleague.user_id });

    expect(response.status).toBe(200);
    expect(response.body.beneficiary.referentId).toBe(colleague.user_id);
  });

  it('refuse de modifier un dossier archivé (409)', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id, {
      lastName: 'Martin',
      archivedAt: new Date(),
    });

    const response = await agent
      .patch(`/api/beneficiaries/${beneficiary.beneficiary_id}`)
      .send({ city: 'Brest' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
    // Rien n'a changé en base
    const inDb = await prisma.beneficiary.findUnique({
      where: { beneficiary_id: beneficiary.beneficiary_id },
    });
    expect(inDb?.city).toBeNull();
  });

  it('refuse une modification vide (400)', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id, {
      lastName: 'Martin',
    });

    const response = await agent
      .patch(`/api/beneficiaries/${beneficiary.beneficiary_id}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("renvoie 404 si le bénéficiaire n'existe pas", async () => {
    const { agent } = await loginAgent();

    const response = await agent
      .patch('/api/beneficiaries/9999')
      .send({ city: 'Brest' });

    expect(response.status).toBe(404);
  });
});
