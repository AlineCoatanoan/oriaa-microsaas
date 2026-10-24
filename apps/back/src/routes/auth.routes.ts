import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { login } from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/login', validate({ body: loginSchema }), login);

export default authRouter;
