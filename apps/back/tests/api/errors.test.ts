import request from 'supertest';
import app from '../../src/app.js';

describe("Gestion des erreurs de l'API", () => {
  it('renvoie 404 au format standard pour une route inconnue', async () => {
    const response = await request(app).get('/api/route-inexistante');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route introuvable : GET /api/route-inexistante',
      },
    });
  });

  it('renvoie 400 pour un JSON mal formé', async () => {
    const response = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"json invalide"');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });
});
