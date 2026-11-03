import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {
  createSubtaskSchema,
  subtaskParamsSchema,
  updateSubtaskSchema,
} from '../schemas/subtask.schema.js';
import { create, remove, update } from '../controllers/subtask.controller.js';
import { idParamsSchema } from '../schemas/common.js';

// mergeParams : donne accès au :id de la tâche, défini dans le routeur parent
const subtaskRouter = Router({ mergeParams: true });

subtaskRouter.post(
  '/',
  validate({ params: idParamsSchema, body: createSubtaskSchema }),
  create,
);

subtaskRouter.patch(
  '/:subtaskId',
  validate({ params: subtaskParamsSchema, body: updateSubtaskSchema }),
  update,
);

subtaskRouter.delete(
  '/:subtaskId',
  validate({ params: subtaskParamsSchema }),
  remove,
);

export default subtaskRouter;
