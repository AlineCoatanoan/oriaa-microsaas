import { Router } from 'express';

const apiRouter = Router();

// GET /api : vérifie que l'API répond
apiRouter.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default apiRouter;
