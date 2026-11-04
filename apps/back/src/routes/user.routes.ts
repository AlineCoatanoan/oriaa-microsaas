import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamsSchema } from '../schemas/common.js';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from '../schemas/user.schema.js';
import {
  archive,
  create,
  list,
  remove,
  update,
} from '../controllers/user.controller.js';

const userRouter = Router();

// Toutes les routes exigent d'être connecté
userRouter.use(authenticate);

userRouter.get('/', validate({ query: listUsersQuerySchema }), list);

userRouter.post(
  '/',
  authorize(ROLES.ADMIN),
  validate({ body: createUserSchema }),
  create,
);

userRouter.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamsSchema, body: updateUserSchema }),
  update,
);

userRouter.patch(
  '/:id/archive',
  authorize(ROLES.ADMIN),
  validate({ params: idParamsSchema }),
  archive,
);

userRouter.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamsSchema }),
  remove,
);

export default userRouter;
