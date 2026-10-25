import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../../src/middlewares/validate.js';
import { errorHandler } from '../../src/middlewares/error-handler.js';

const bodySchema = z.object({
  email: z.email(),
  firstName: z.string().min(1),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Mini-app : renvoie les données reçues après validation. */
function buildApp() {
  const app = express();
  app.use(express.json());

  app.post('/items', validate({ body: bodySchema }), (req, res) => {
    res.status(200).json(req.body);
  });

  app.get('/items/:id', validate({ params: paramsSchema }), (_req, res) => {
    res.status(200).json(res.locals.validated.params);
  });

  app.use(errorHandler);
  return app;
}

describe('validate', () => {
  it('laisse passer des données valides', async () => {
    const response = await request(buildApp())
      .post('/items')
      .send({ email: 'aline@oriaa.test', firstName: 'Aline' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: 'aline@oriaa.test',
      firstName: 'Aline',
    });
  });

  it('retire les champs inconnus du corps', async () => {
    const response = await request(buildApp())
      .post('/items')
      .send({ email: 'aline@oriaa.test', firstName: 'Aline', role: 'admin' });

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty('role');
  });

  it('rejette des données invalides avec le détail des erreurs', async () => {
    const response = await request(buildApp())
      .post('/items')
      .send({ email: 'pas-un-email', firstName: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('BAD_REQUEST');
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ location: 'body', field: 'email' }),
        expect.objectContaining({ location: 'body', field: 'firstName' }),
      ]),
    );
  });

  it('convertit et valide les paramètres d’URL', async () => {
    const valid = await request(buildApp()).get('/items/12');
    expect(valid.status).toBe(200);
    expect(valid.body).toEqual({ id: 12 });

    const invalid = await request(buildApp()).get('/items/abc');
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.details[0]).toMatchObject({
      location: 'params',
      field: 'id',
    });
  });

  it('traite un corps absent comme un objet vide', async () => {
    // Aucune donnée envoyée, et pas de express.json() : req.body reste undefined
    const app = express();
    app.post('/items', validate({ body: bodySchema }), (_req, res) => {
      res.status(200).end();
    });
    app.use(errorHandler);

    const response = await request(app).post('/items');

    expect(response.status).toBe(400);
    // Chaque champ manquant est signalé, plutôt qu'une erreur générale
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'firstName' }),
      ]),
    );
  });
});
