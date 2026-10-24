import './config/zod.js';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { notFound } from './middlewares/not-found.js';
import { errorHandler } from './middlewares/error-handler.js';
import apiRouter from './routes/index.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser());

// En-têtes HTTP de sécurité (et suppression de X-Powered-By)
app.use(helmet());

// Seul le front ORIAA peut appeler l'API depuis un navigateur.
// credentials: true autorise l'envoi du cookie d'authentification.
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
