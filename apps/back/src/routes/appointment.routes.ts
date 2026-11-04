import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { idParamsSchema } from '../schemas/common.js';
import {
  createAppointmentSchema,
  listAppointmentsQuerySchema,
  updateAppointmentSchema,
} from '../schemas/appointment.schema.js';
import {
  create,
  getById,
  list,
  remove,
  update,
} from '../controllers/appointment.controller.js';

const appointmentRouter = Router();

// Toutes les routes des rendez-vous exigent d'être connecté (tous rôles)
appointmentRouter.use(authenticate);

appointmentRouter.get(
  '/',
  validate({ query: listAppointmentsQuerySchema }),
  list,
);

appointmentRouter.post(
  '/',
  validate({ body: createAppointmentSchema }),
  create,
);

appointmentRouter.get('/:id', validate({ params: idParamsSchema }), getById);

appointmentRouter.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateAppointmentSchema }),
  update,
);

appointmentRouter.delete('/:id', validate({ params: idParamsSchema }), remove);

export default appointmentRouter;
