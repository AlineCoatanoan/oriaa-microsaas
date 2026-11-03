import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdSchema,
  updateTaskSchema,
} from '../schemas/task.schema.js';
import {
  create,
  getById,
  list,
  remove,
  update,
} from '../controllers/task.controller.js';

const taskRouter = Router();

// Toutes les routes des tâches exigent d'être connecté (tous rôles)
taskRouter.use(authenticate);

taskRouter.get('/', validate({ query: listTasksQuerySchema }), list);

taskRouter.post('/', validate({ body: createTaskSchema }), create);

taskRouter.get('/:id', validate({ params: taskIdSchema }), getById);

taskRouter.patch(
  '/:id',
  validate({ params: taskIdSchema, body: updateTaskSchema }),
  update,
);

taskRouter.delete('/:id', validate({ params: taskIdSchema }), remove);

export default taskRouter;
