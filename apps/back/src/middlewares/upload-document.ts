import type { RequestHandler } from 'express';
import multer from 'multer';
import { BadRequestError } from '../errors/app-error.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

// En mémoire : jamais sur le disque du serveur, qui est éphémère sur Render
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('file');

/** Reçoit un seul fichier, dans le champ "file", et le place dans req.file. */
export const uploadDocument: RequestHandler = (req, res, next) => {
  upload(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Le fichier dépasse la taille maximale de 5 Mo.'
          : 'Envoi du fichier invalide.';
      next(new BadRequestError(message));
      return;
    }
    next(error);
  });
};
