import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { saveTaskFilterSchema } from '../schemas/task-filter.schema.js';
import { get, remove, save } from '../controllers/task-filter.controller.js';

const taskFilterRouter = Router();

taskFilterRouter.get('/', get);
taskFilterRouter.put('/', validate({ body: saveTaskFilterSchema }), save);
taskFilterRouter.delete('/', remove);

export default taskFilterRouter;
