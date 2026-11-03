import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createBeneficiarySchema,
  listBeneficiariesQuerySchema,
  updateBeneficiarySchema,
  archiveBeneficiarySchema,
} from '../schemas/beneficiary.schema.js';
import {
  create,
  getById,
  getTimeline,
  list,
  update,
  archive,
  unarchive,
  remove,
} from '../controllers/beneficiary.controller.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';
import noteRouter from './note.routes.js';
import { idParamsSchema } from '../schemas/common.js';

const beneficiaryRouter = Router();

// Toutes les routes bénéficiaires exigent d'être connecté (tous rôles)
beneficiaryRouter.use(authenticate);
beneficiaryRouter.use('/:id/notes', noteRouter);

beneficiaryRouter.get(
  '/',
  validate({ query: listBeneficiariesQuerySchema }),
  list,
);

beneficiaryRouter.post(
  '/',
  validate({ body: createBeneficiarySchema }),
  create,
);
beneficiaryRouter.get('/:id', validate({ params: idParamsSchema }), getById);

beneficiaryRouter.get(
  '/:id/timeline',
  validate({ params: idParamsSchema }),
  getTimeline,
);

beneficiaryRouter.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateBeneficiarySchema }),
  update,
);

beneficiaryRouter.patch(
  '/:id/archive',
  validate({ params: idParamsSchema, body: archiveBeneficiarySchema }),
  archive,
);

beneficiaryRouter.patch(
  '/:id/unarchive',
  validate({ params: idParamsSchema }),
  unarchive,
);

// Suppression définitive (RGPD) : réservée aux admins
beneficiaryRouter.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamsSchema }),
  remove,
);

export default beneficiaryRouter;
