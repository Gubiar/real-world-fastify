import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { DatabaseConfig } from '../types/database';
import { env } from '../config/env';

export function createDbConnection(config?: Partial<DatabaseConfig>) {
  const connectionString = config?.url || env.DATABASE_URL;
  const logger = config?.logger ?? env.NODE_ENV === 'development';
  
  const client = postgres(connectionString, {
    max: config?.poolMax || env.DB_POOL_MAX,
    idle_timeout: config?.idleTimeout || env.DB_IDLE_TIMEOUT,
    connect_timeout: config?.connectionTimeout || env.DB_CONNECTION_TIMEOUT,
    max_lifetime: 60 * 30,
    connection: {
      application_name: 'fastify-auth-api',
    },
    onnotice: () => {},
  });
  
  return drizzle(client, {
    schema,
    logger: logger,
  });
}

export type DbConnection = ReturnType<typeof createDbConnection>;

