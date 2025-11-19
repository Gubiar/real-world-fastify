import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createDbConnection, DbConnection } from '../db/connection';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbConnection;
  }
}

const drizzlePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const databaseUrl = process.env['DATABASE_URL'];
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const db = createDbConnection(
    databaseUrl,
    process.env['NODE_ENV'] === 'development'
  );

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.$client.end();
  });
};

export default fp(drizzlePlugin);

