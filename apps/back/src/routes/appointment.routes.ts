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
import { APPOINTMENTS_LISTING } from '../config/constants.js';
import { createFilterPreferenceRouter } from './filter-preference.routes.js';

const appointmentRouter = Router();

// Toutes les routes des rendez-vous exigent d'être connecté (tous rôles)
appointmentRouter.use(authenticate);

// Avant /:id : sinon "filter-preference" serait pris pour un identifiant
appointmentRouter.use(
  '/filter-preference',
  createFilterPreferenceRouter(APPOINTMENTS_LISTING),
);

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
