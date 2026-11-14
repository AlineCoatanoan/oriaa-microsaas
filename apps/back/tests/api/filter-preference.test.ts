import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import prisma from '../../src/lib/prisma.js';
import { resetDatabase } from '../helpers/database.js';
import { createUser, loginAgent } from '../helpers/users.js';

const BENEFICIARIES_FILTER = '/api/beneficiaries/filter-preference';
const TASKS_FILTER = '/api/tasks/filter-preference';

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Filtre enregistré des bénéficiaires', () => {
  it('enregistre le référent choisi et le renvoie ensuite', async () => {
    const { agent } = await loginAgent();
    const colleague = await createUser({ email: 'collegue@oriaa.test' });

    const saved = await agent
      .put(BENEFICIARIES_FILTER)
      .send({ userId: colleague.user_id });
    const found = await agent.get(BENEFICIARIES_FILTER);

    expect(saved.status).toBe(200);
    expect(found.body.filterPreference).toEqual({
      userId: colleague.user_id,
    });
  });

  it('refuse un utilisateur archivé', async () => {
    const { agent } = await loginAgent();
    const archived = await createUser({
      email: 'archive@oriaa.test',
      archivedAt: new Date(),
    });

    const response = await agent
      .put(BENEFICIARIES_FILTER)
      .send({ userId: archived.user_id });

    expect(response.status).toBe(400);
  });

  it('reste indépendant du filtre de la page des tâches', async () => {
    const { agent, user } = await loginAgent();

    await agent.put(BENEFICIARIES_FILTER).send({ userId: user.user_id });
    const tasksFilter = await agent.get(TASKS_FILTER);

    expect(tasksFilter.body.filterPreference).toBeNull();
  });

  it('retire le filtre enregistré', async () => {
    const { agent, user } = await loginAgent();
    await agent.put(BENEFICIARIES_FILTER).send({ userId: user.user_id });

    const removed = await agent.delete(BENEFICIARIES_FILTER);
    const found = await agent.get(BENEFICIARIES_FILTER);

    expect(removed.status).toBe(204);
    expect(found.body.filterPreference).toBeNull();
  });
});
