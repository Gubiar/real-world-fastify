import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createDbConnection, DbConnection } from '../db/connection';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbConnection;
  }
}

const drizzlePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const db = createDbConnection();

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.$client.end();
  });
};

export default fp(drizzlePlugin);

