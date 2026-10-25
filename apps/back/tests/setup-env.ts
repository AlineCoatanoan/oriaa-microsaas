import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Chemin de .env.test, relatif à ce fichier
const envTestPath = fileURLToPath(new URL('../.env.test', import.meta.url));

dotenv.config({
  path: envTestPath,
  override: true,
  quiet: true,
});
