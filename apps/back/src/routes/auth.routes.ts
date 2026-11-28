import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema.js';
import {
  changePassword,
  forgotPassword,
  login,
  resetPassword,
  session,
  logout,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
  forgotPasswordRateLimit,
  loginRateLimit,
  resetPasswordRateLimit,
} from '../middlewares/login-rate-limit.js';

const authRouter = Router();

authRouter.post(
  '/login',
  loginRateLimit,
  validate({ body: loginSchema }),
  login,
);
authRouter.get('/session', authenticate, session);
authRouter.post('/logout', logout);
authRouter.patch(
  '/password',
  authenticate,
  validate({ body: changePasswordSchema }),
  changePassword,
);

// Mot de passe oublié : sans être connecté
authRouter.post(
  '/forgot-password',
  forgotPasswordRateLimit,
  validate({ body: forgotPasswordSchema }),
  forgotPassword,
);
authRouter.post(
  '/reset-password',
  resetPasswordRateLimit,
  validate({ body: resetPasswordSchema }),
  resetPassword,
);

export default authRouter;
