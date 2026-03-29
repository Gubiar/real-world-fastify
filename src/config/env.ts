import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'test' | 'production';
type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
type CorsOrigin = true | string | string[];

function getString(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value !== undefined && value !== '') {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

function getNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
}

function getNodeEnv(): NodeEnv {
  const value = getString('NODE_ENV', 'development');
  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }
  throw new Error('NODE_ENV must be one of: development, test, production');
}

function getLogLevel(): LogLevel {
  const value = getString('LOG_LEVEL', 'info');
  const logLevels: LogLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
  if (logLevels.includes(value as LogLevel)) {
    return value as LogLevel;
  }
  throw new Error(`LOG_LEVEL must be one of: ${logLevels.join(', ')}`);
}

const nodeEnv = getNodeEnv();
const corsRaw = getString('CORS_ORIGIN', '*');

function parseCorsOrigin(value: string): CorsOrigin {
  if (value === '*') {
    return true;
  }
  const origins = value.split(',').map(origin => origin.trim()).filter(Boolean);
  if (origins.length <= 1) {
    return origins[0] || true;
  }
  return origins;
}

export const config = {
  nodeEnv,
  port: getNumber('PORT', 3000),
  host: getString('HOST', '0.0.0.0'),
  databaseUrl: getString('DATABASE_URL'),
  jwtSecret: getString('JWT_SECRET', nodeEnv === 'production' ? undefined : 'super-secret-jwt-token'),
  jwtExpiresIn: getString('JWT_EXPIRES_IN', '1d'),
  corsOrigin: parseCorsOrigin(corsRaw),
  logLevel: getLogLevel(),
  bcryptRounds: getNumber('BCRYPT_ROUNDS', 10),
  rateLimitMax: getNumber('RATE_LIMIT_MAX', 100),
  rateLimitWindow: getString('RATE_LIMIT_WINDOW', '1 minute'),
  rateLimitAuthMax: getNumber('RATE_LIMIT_AUTH_MAX', 5),
  rateLimitAuthWindow: getString('RATE_LIMIT_AUTH_WINDOW', '1 minute')
} as const;
