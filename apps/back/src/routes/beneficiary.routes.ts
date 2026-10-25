import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createBeneficiarySchema,
  beneficiaryIdSchema,
  listBeneficiariesQuerySchema,
  updateBeneficiarySchema,
  archiveBeneficiarySchema,
} from '../schemas/beneficiary.schema.js';
import {
  create,
  getById,
  list,
  update,
  archive,
  unarchive,
  remove,
} from '../controllers/beneficiary.controller.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../config/roles.js';

const beneficiaryRouter = Router();

// Toutes les routes bénéficiaires exigent d'être connecté (tous rôles)
beneficiaryRouter.use(authenticate);

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
beneficiaryRouter.get(
  '/:id',
  validate({ params: beneficiaryIdSchema }),
  getById,
);

beneficiaryRouter.patch(
  '/:id',
  validate({ params: beneficiaryIdSchema, body: updateBeneficiarySchema }),
  update,
);

beneficiaryRouter.patch(
  '/:id/archive',
  validate({ params: beneficiaryIdSchema, body: archiveBeneficiarySchema }),
  archive,
);

beneficiaryRouter.patch(
  '/:id/unarchive',
  validate({ params: beneficiaryIdSchema }),
  unarchive,
);

// Suppression définitive (RGPD) : réservée aux admins
beneficiaryRouter.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: beneficiaryIdSchema }),
  remove,
);

export default beneficiaryRouter;
