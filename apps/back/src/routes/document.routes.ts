import { Router } from 'express';
import { uploadDocument } from '../middlewares/upload-document.js';
import { validate } from '../middlewares/validate.js';
import { idParamsSchema } from '../schemas/common.js';
import {
  createDocumentSchema,
  documentParamsSchema,
  updateDocumentSchema,
} from '../schemas/document.schema.js';
import {
  create,
  download,
  list,
  remove,
  update,
} from '../controllers/document.controller.js';

// mergeParams : donne accès au :id du bénéficiaire, défini dans le routeur parent
const documentRouter = Router({ mergeParams: true });

documentRouter.get('/', validate({ params: idParamsSchema }), list);

// uploadDocument d'abord : il remplit req.body, que validate vérifie ensuite
documentRouter.post(
  '/',
  uploadDocument,
  validate({ params: idParamsSchema, body: createDocumentSchema }),
  create,
);

documentRouter.get(
  '/:documentId/download',
  validate({ params: documentParamsSchema }),
  download,
);

documentRouter.patch(
  '/:documentId',
  validate({ params: documentParamsSchema, body: updateDocumentSchema }),
  update,
);

documentRouter.delete(
  '/:documentId',
  validate({ params: documentParamsSchema }),
  remove,
);

export default documentRouter;
