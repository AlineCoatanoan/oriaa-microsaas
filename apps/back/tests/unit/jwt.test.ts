import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { signAccessToken, verifyAccessToken } from '../../src/lib/jwt.js';
import { env } from '../../src/config/env.js';
import { UnauthorizedError } from '../../src/errors/app-error.js';

describe('JWT', () => {
  it("crée un token qui contient l'identifiant et le rôle", () => {
    const token = signAccessToken({ userId: 12, role: 'admin' });

    expect(verifyAccessToken(token)).toEqual({ userId: 12, role: 'admin' });
  });

  it('refuse un token expiré', () => {
    const expired = jwt.sign(
      { role: 'user', exp: Math.floor(Date.now() / 1000) - 60 },
      env.JWT_SECRET,
      { subject: '12' },
    );

    expect(() => verifyAccessToken(expired)).toThrow(UnauthorizedError);
  });

  it('refuse un token signé avec une autre clé', () => {
    const forged = jwt.sign(
      { role: 'admin' },
      'une-autre-cle-secrete-tres-longue-123456',
      {
        subject: '12',
      },
    );

    expect(() => verifyAccessToken(forged)).toThrow(UnauthorizedError);
  });

  it('refuse un token mal formé', () => {
    expect(() => verifyAccessToken('pas-un-token')).toThrow(UnauthorizedError);
  });
});
