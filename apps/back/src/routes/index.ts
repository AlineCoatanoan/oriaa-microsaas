import { Router } from 'express';
import authRouter from './auth.routes.js';
import beneficiaryRouter from './beneficiary.routes.js';
import taskRouter from './task.routes.js';
import appointmentRouter from './appointment.routes.js';
import userRouter from './user.routes.js';

const apiRouter = Router();

// GET /api : vérifie que l'API répond
apiRouter.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/beneficiaries', beneficiaryRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/appointments', appointmentRouter);
apiRouter.use('/users', userRouter);

export default apiRouter;
