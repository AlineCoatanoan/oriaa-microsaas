import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from '../schemas/task.schema.js';
import {
  create,
  getById,
  list,
  remove,
  update,
} from '../controllers/task.controller.js';
import subtaskRouter from './subtask.routes.js';
import taskFilterRouter from './task-filter.routes.js';
import { idParamsSchema } from '../schemas/common.js';

const taskRouter = Router();

// Toutes les routes des tâches exigent d'être connecté (tous rôles)
taskRouter.use(authenticate);

taskRouter.use('/:id/subtasks', subtaskRouter);

// Avant /:id : sinon "filter-preference" serait pris pour un identifiant
taskRouter.use('/filter-preference', taskFilterRouter);

taskRouter.get('/', validate({ query: listTasksQuerySchema }), list);

taskRouter.post('/', validate({ body: createTaskSchema }), create);

taskRouter.get('/:id', validate({ params: idParamsSchema }), getById);

taskRouter.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateTaskSchema }),
  update,
);

taskRouter.delete('/:id', validate({ params: idParamsSchema }), remove);

export default taskRouter;
