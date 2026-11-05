import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import prisma from '../../src/lib/prisma.js';
import { resetDatabase } from '../helpers/database.js';
import { loginAgent } from '../helpers/users.js';

const pdf = Buffer.from('%PDF-1.4\n% Document de test\n');

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

/** Crée directement un bénéficiaire en base. */
async function createBeneficiary(userId: number, archivedAt?: Date) {
  return prisma.beneficiary.create({
    data: {
      last_name: 'Martin',
      first_name: 'Lucas',
      entry_date: new Date('2026-10-01'),
      archived_at: archivedAt,
      user_id: userId,
    },
  });
}

/** Crée directement un document en base. */
async function createDocument(beneficiaryId: number, userId: number) {
  return prisma.document.create({
    data: {
      title: 'Carte Vitale',
      file_name: 'carte.pdf',
      category: 'Santé',
      mime_type: 'application/pdf',
      size_bytes: pdf.length,
      content: new Uint8Array(pdf),
      beneficiary_id: beneficiaryId,
      user_id: userId,
    },
  });
}

describe('Documents d’un bénéficiaire', () => {
  it('importe un PDF et le range dans un dossier existant, sans tenir compte de la casse', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id);
    await createDocument(beneficiary.beneficiary_id, user.user_id);

    const response = await agent
      .post(`/api/beneficiaries/${beneficiary.beneficiary_id}/documents`)
      .field('title', 'Attestation CSS')
      .field('category', 'santé')
      .attach('file', pdf, 'attestation.pdf');

    expect(response.status).toBe(201);
    expect(response.body.document).toMatchObject({
      title: 'Attestation CSS',
      category: 'Santé',
      mimeType: 'application/pdf',
    });
  });

  it('refuse un format non autorisé, même avec une fausse extension (400)', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id);

    const response = await agent
      .post(`/api/beneficiaries/${beneficiary.beneficiary_id}/documents`)
      .field('title', 'Faux PDF')
      .field('category', 'Santé')
      .attach('file', Buffer.from('ceci est du texte'), 'faux.pdf');

    expect(response.status).toBe(400);
    expect(await prisma.document.count()).toBe(0);
  });

  it('refuse un fichier de plus de 5 Mo (400)', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id);

    const response = await agent
      .post(`/api/beneficiaries/${beneficiary.beneficiary_id}/documents`)
      .field('title', 'Trop gros')
      .field('category', 'Santé')
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), 'gros.pdf');

    expect(response.status).toBe(400);
    expect(await prisma.document.count()).toBe(0);
  });

  it('liste les documents sans leur contenu, et le téléchargement renvoie le fichier', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id);
    const document = await createDocument(
      beneficiary.beneficiary_id,
      user.user_id,
    );
    const url = `/api/beneficiaries/${beneficiary.beneficiary_id}/documents`;

    const list = await agent.get(url);
    const file = await agent.get(`${url}/${document.document_id}/download`);

    expect(list.status).toBe(200);
    expect(list.body.documents[0]).not.toHaveProperty('content');
    expect(file.status).toBe(200);
    expect(file.headers['content-type']).toContain('application/pdf');
    expect(file.headers['content-disposition']).toContain('attachment');
  });

  it('garde les documents d’un dossier archivé en lecture seule', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id, new Date());
    const document = await createDocument(
      beneficiary.beneficiary_id,
      user.user_id,
    );
    const url = `/api/beneficiaries/${beneficiary.beneficiary_id}/documents`;

    const read = await agent.get(url);
    const updated = await agent
      .patch(`${url}/${document.document_id}`)
      .send({ title: 'Nouveau titre' });
    const deleted = await agent.delete(`${url}/${document.document_id}`);

    expect(read.status).toBe(200);
    expect(updated.status).toBe(409);
    expect(deleted.status).toBe(409);
  });

  it('refuse le téléchargement du document d’un autre bénéficiaire (404)', async () => {
    const { agent, user } = await loginAgent();
    const beneficiary = await createBeneficiary(user.user_id);
    const other = await createBeneficiary(user.user_id);
    const document = await createDocument(other.beneficiary_id, user.user_id);

    const response = await agent.get(
      `/api/beneficiaries/${beneficiary.beneficiary_id}/documents/${document.document_id}/download`,
    );

    expect(response.status).toBe(404);
  });

  it('refuse une requête sans être connecté', async () => {
    const response = await request(app).get('/api/beneficiaries/1/documents');

    expect(response.status).toBe(401);
  });

  it('supprime les documents avec le dossier (RGPD)', async () => {
    const { agent, user } = await loginAgent({ role: 'admin' });
    const beneficiary = await createBeneficiary(user.user_id, new Date());
    await createDocument(beneficiary.beneficiary_id, user.user_id);

    const response = await agent.delete(
      `/api/beneficiaries/${beneficiary.beneficiary_id}`,
    );

    expect(response.status).toBe(204);
    expect(await prisma.document.count()).toBe(0);
  });
});
