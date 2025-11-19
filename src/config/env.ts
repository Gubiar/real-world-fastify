import { z } from 'zod';
import dotenv from 'dotenv';

if (process.env['NODE_ENV'] !== 'test') {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess(
    (val) => (val ? Number(val) : 3000),
    z.number().default(3000)
  ),
  HOST: z.string().default('0.0.0.0'),
  
  DATABASE_URL: z.string().url(),
  DB_POOL_MIN: z.preprocess(
    (val) => (val ? Number(val) : 2),
    z.number().default(2)
  ),
  DB_POOL_MAX: z.preprocess(
    (val) => (val ? Number(val) : 10),
    z.number().default(10)
  ),
  DB_IDLE_TIMEOUT: z.preprocess(
    (val) => (val ? Number(val) : 10000),
    z.number().default(10000)
  ),
  DB_CONNECTION_TIMEOUT: z.preprocess(
    (val) => (val ? Number(val) : 5000),
    z.number().default(5000)
  ),
  
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  BCRYPT_ROUNDS: z.preprocess(
    (val) => (val ? Number(val) : 12),
    z.number().default(12)
  ),
  
  RATE_LIMIT_MAX: z.preprocess(
    (val) => (val ? Number(val) : 100),
    z.number().default(100)
  ),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
  RATE_LIMIT_AUTH_MAX: z.preprocess(
    (val) => (val ? Number(val) : 5),
    z.number().default(5)
  ),
  RATE_LIMIT_AUTH_WINDOW: z.string().default('15 minutes'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }
  
  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}

export const env = validateEnv();

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

