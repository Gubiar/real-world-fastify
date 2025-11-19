import dotenv from 'dotenv';
import path from 'path';

const envFile = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envFile });

process.env['NODE_ENV'] = process.env['NODE_ENV'] || 'test';
process.env['DATABASE_URL'] = process.env['DATABASE_URL'] || 'postgresql://admin:admin@localhost:5433/mydb_test';
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || 'test-jwt-secret-minimum-32-characters-for-security-validation';
process.env['PORT'] = process.env['PORT'] || '3001';
process.env['HOST'] = process.env['HOST'] || '0.0.0.0';
process.env['CORS_ORIGIN'] = process.env['CORS_ORIGIN'] || '*';
process.env['LOG_LEVEL'] = process.env['LOG_LEVEL'] || 'error';
process.env['DB_POOL_MIN'] = process.env['DB_POOL_MIN'] || '2';
process.env['DB_POOL_MAX'] = process.env['DB_POOL_MAX'] || '5';
process.env['DB_IDLE_TIMEOUT'] = process.env['DB_IDLE_TIMEOUT'] || '10000';
process.env['DB_CONNECTION_TIMEOUT'] = process.env['DB_CONNECTION_TIMEOUT'] || '5000';
process.env['JWT_EXPIRES_IN'] = process.env['JWT_EXPIRES_IN'] || '1d';
process.env['BCRYPT_ROUNDS'] = process.env['BCRYPT_ROUNDS'] || '10';
process.env['RATE_LIMIT_MAX'] = process.env['RATE_LIMIT_MAX'] || '1000';
process.env['RATE_LIMIT_WINDOW'] = process.env['RATE_LIMIT_WINDOW'] || '1 minute';
process.env['RATE_LIMIT_AUTH_MAX'] = process.env['RATE_LIMIT_AUTH_MAX'] || '50';
process.env['RATE_LIMIT_AUTH_WINDOW'] = process.env['RATE_LIMIT_AUTH_WINDOW'] || '1 minute';

