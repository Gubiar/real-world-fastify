import { PrismaClient } from '@prisma/client';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// Declare the type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

  // Connect to the database
  await prisma.$connect();

  // Make Prisma available through the Fastify instance
  fastify.decorate('prisma', prisma);

  // Close the Prisma connection when Fastify server is shutting down
  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });
};

export default fp(prismaPlugin); 