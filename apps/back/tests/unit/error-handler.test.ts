import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../src/middlewares/error-handler.js';
import { BadRequestError, ConflictError } from '../../src/errors/app-error.js';

/** Mini-app dont l'unique route lève l'erreur fournie. */
function buildApp(error: unknown) {
  const app = express();
  app.get('/boom', () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  it("utilise le code HTTP et le code applicatif d'une AppError", async () => {
    const response = await request(
      buildApp(new ConflictError('Email déjà utilisé.')),
    ).get('/boom');

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { code: 'CONFLICT', message: 'Email déjà utilisé.' },
    });
  });

  it('inclut les détails lorsqu’ils sont fournis', async () => {
    const details = [{ field: 'email', message: 'Format invalide' }];
    const response = await request(
      buildApp(new BadRequestError('Données invalides.', details)),
    ).get('/boom');

    expect(response.status).toBe(400);
    expect(response.body.error.details).toEqual(details);
  });

  it("masque le message d'une erreur inattendue", async () => {
    const response = await request(
      buildApp(new Error('mot de passe de la base : secret')),
    ).get('/boom');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue.',
      },
    });
    expect(JSON.stringify(response.body)).not.toContain('secret');
  });
});
