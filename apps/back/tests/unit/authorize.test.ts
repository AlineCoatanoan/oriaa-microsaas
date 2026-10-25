import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { authorize } from '../../src/middlewares/authorize.js';
import { errorHandler } from '../../src/middlewares/error-handler.js';
import type { PublicUser } from '../../src/services/auth.service.js';

/** Utilisateur connecté simulé, avec le rôle choisi. */
function fakeUser(role: string): PublicUser {
  return {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@oriaa.test',
    job: 'Educatrice',
    role,
  };
}

/** Mini-app : simule authenticate, puis applique authorize('admin'). */
function buildApp(user?: PublicUser) {
  const app = express();

  app.use((_req, res, next) => {
    res.locals.user = user;
    next();
  });

  app.get('/admin', authorize('admin'), (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use(errorHandler);
  return app;
}

describe('authorize', () => {
  it('laisse passer un utilisateur qui a le bon rôle', async () => {
    const response = await request(buildApp(fakeUser('admin'))).get('/admin');

    expect(response.status).toBe(200);
  });

  it("refuse un utilisateur connecté qui n'a pas le bon rôle (403)", async () => {
    const response = await request(buildApp(fakeUser('user'))).get('/admin');

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('refuse une requête sans utilisateur connecté (401)', async () => {
    const response = await request(buildApp()).get('/admin');

    expect(response.status).toBe(401);
  });
});
