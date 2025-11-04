import pino from 'pino';
import dotenv from 'dotenv';
dotenv.config();


const pretty = process.env['LOG_PRETTY'] === 'true';

const options = pretty
  ? { transport: { target: 'pino-pretty' } }
  : {};


export const logger = pino(options as unknown as pino.LoggerOptions);
