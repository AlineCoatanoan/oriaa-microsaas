import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Limite de tentatives de connexion', () => {
  it('bloque après 10 échecs depuis la même adresse (429)', async () => {
    const attempt = () =>
      request(app)
        .post('/api/auth/login')
        .send({ email: 'inconnu@oriaa.test', password: 'mauvais' });

    for (let i = 0; i < 10; i += 1) {
      expect((await attempt()).status).toBe(401);
    }

    const blocked = await attempt();

    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS');
  });
});
