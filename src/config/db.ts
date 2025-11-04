import mongoose from 'mongoose';
import { logger } from '../middleware/logger.middleware';

export async function connectDB(uri: string) {
  try {
    await mongoose.connect(uri);
    logger.info('MongoDB conectado');
  } catch (err) {
    logger.error({ err }, 'Error conectando a MongoDB');
    process.exit(1);
  }
}
