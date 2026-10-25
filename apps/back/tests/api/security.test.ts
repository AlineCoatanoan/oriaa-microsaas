import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { env } from '../../src/config/env.js';

describe('Sécurité HTTP', () => {
  describe('En-têtes Helmet', () => {
    it('ajoute les en-têtes de sécurité', async () => {
      const response = await request(app).get('/api');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    it("masque la technologie du serveur (pas d'en-tête X-Powered-By)", async () => {
      const response = await request(app).get('/api');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('CORS', () => {
    it('autorise le front ORIAA et l’envoi du cookie', async () => {
      const response = await request(app)
        .get('/api')
        .set('Origin', env.FRONTEND_URL);

      expect(response.headers['access-control-allow-origin']).toBe(
        env.FRONTEND_URL,
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it("n'autorise pas une autre origine", async () => {
      const response = await request(app)
        .get('/api')
        .set('Origin', 'https://site-malveillant.example');

      expect(response.headers['access-control-allow-origin']).not.toBe(
        'https://site-malveillant.example',
      );
    });
  });
});
