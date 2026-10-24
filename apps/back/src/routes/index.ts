import { Router } from 'express';
import authRouter from './auth.routes.js';

const apiRouter = Router();

// GET /api : vérifie que l'API répond
apiRouter.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);

export default apiRouter;
