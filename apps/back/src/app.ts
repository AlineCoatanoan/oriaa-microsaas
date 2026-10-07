import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello ORIAA!');
});

export default app;
