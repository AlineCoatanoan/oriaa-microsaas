import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createBeneficiarySchema,
  beneficiaryIdSchema,
} from '../schemas/beneficiary.schema.js';
import { create, getById } from '../controllers/beneficiary.controller.js';

const beneficiaryRouter = Router();

// Toutes les routes bénéficiaires exigent d'être connecté (tous rôles)
beneficiaryRouter.use(authenticate);

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

export default beneficiaryRouter;
