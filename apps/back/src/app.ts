import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { notFound } from './middlewares/not-found.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/api', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
