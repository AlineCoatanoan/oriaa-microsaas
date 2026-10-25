import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { login, session, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const authRouter = Router();

authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.get('/session', authenticate, session);
authRouter.post('/logout', logout);

export default authRouter;
