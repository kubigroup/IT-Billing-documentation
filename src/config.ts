import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  serviceName: string;
  user: string;
  password: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  outputDir: string;
}

export const config: AppConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1521'),
    serviceName: process.env.DB_SERVICE_NAME || 'XEPDB1',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || ''
  },
  outputDir: process.env.OUTPUT_DIR || './ddl_output'
};

// Validate required configuration
export function validateConfig(): void {
  if (!config.database.user) {
    throw new Error('DB_USER environment variable is required');
  }
  if (!config.database.password) {
    throw new Error('DB_PASSWORD environment variable is required');
  }
}
