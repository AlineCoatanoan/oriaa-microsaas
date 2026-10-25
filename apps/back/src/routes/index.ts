import { Router } from 'express';
import authRouter from './auth.routes.js';
import beneficiaryRouter from './beneficiary.routes.js';

const apiRouter = Router();

// GET /api : vérifie que l'API répond
apiRouter.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/beneficiaries', beneficiaryRouter);

export default apiRouter;
