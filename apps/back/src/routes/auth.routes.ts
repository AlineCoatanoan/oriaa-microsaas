import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { changePasswordSchema, loginSchema } from '../schemas/auth.schema.js';
import {
  changePassword,
  login,
  session,
  logout,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginRateLimit } from '../middlewares/login-rate-limit.js';

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

export default authRouter;
