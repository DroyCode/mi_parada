import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { logger } from './middleware/logger.middleware';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const ENV = process.env.NODE_ENV || 'development';

if (!MONGODB_URI) {
  logger.error('MONGODB_URI no está definida en el .env. Abortando.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET no está definida en el .env. Abortando.');
  process.exit(1);
}

async function main() {
  try {
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      logger.info(`🚀 Server running (${ENV}) on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, 'Error iniciando la aplicación');
    process.exit(1);
  }
}

main();
