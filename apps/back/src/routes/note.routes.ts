import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {
  createNoteSchema,
  noteParamsSchema,
  updateNoteSchema,
} from '../schemas/note.schema.js';
import {
  create,
  list,
  remove,
  update,
} from '../controllers/note.controller.js';
import { idParamsSchema } from '../schemas/common.js';

// mergeParams : donne accès au :id du bénéficiaire, défini dans le routeur parent
const noteRouter = Router({ mergeParams: true });

noteRouter.get('/', validate({ params: idParamsSchema }), list);

noteRouter.post(
  '/',
  validate({ params: idParamsSchema, body: createNoteSchema }),
  create,
);

noteRouter.patch(
  '/:noteId',
  validate({ params: noteParamsSchema, body: updateNoteSchema }),
  update,
);

noteRouter.delete('/:noteId', validate({ params: noteParamsSchema }), remove);

export default noteRouter;
