import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'node:path';
import { createDbConnection, DbConnection } from '../db/connection';
import { config } from '../config/env';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbConnection;
  }
}

const drizzlePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const db = createDbConnection(config.databaseUrl, config.nodeEnv === 'development');

  if (config.runMigrationsOnStartup) {
    fastify.log.info('Running database migrations...');
    await migrate(db, { migrationsFolder: path.join(__dirname, '../db/migrations') });
    fastify.log.info('Database migrations completed');
  }

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.$client.end();
  });
};

export default fp(drizzlePlugin);

