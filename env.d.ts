declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
    MONGODB_URI: string;   
    JWT_SECRET: string;   
    LOG_PRETTY?: 'true' | 'false';
  }
}
