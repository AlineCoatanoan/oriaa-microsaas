import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createBeneficiarySchema,
  beneficiaryIdSchema,
  listBeneficiariesQuerySchema,
  updateBeneficiarySchema,
} from '../schemas/beneficiary.schema.js';
import {
  create,
  getById,
  list,
  update,
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

beneficiaryRouter.patch(
  '/:id',
  validate({ params: beneficiaryIdSchema, body: updateBeneficiarySchema }),
  update,
);

export default beneficiaryRouter;
