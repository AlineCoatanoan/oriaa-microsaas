import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createBeneficiarySchema,
  beneficiaryIdSchema,
  listBeneficiariesQuerySchema,
} from '../schemas/beneficiary.schema.js';
import {
  create,
  getById,
  list,
} from '../controllers/beneficiary.controller.js';

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

export default beneficiaryRouter;
