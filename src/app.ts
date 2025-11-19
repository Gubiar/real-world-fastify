import { FastifyInstance } from 'fastify';
import { buildApp } from './app.factory';
import { env } from './config/env';

let server: FastifyInstance;

const closeGracefully = async (signal: string) => {
  console.log(`Received signal ${signal}, shutting down...`);
  try {
    if (server) {
      await server.close();
    }
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  closeGracefully('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  closeGracefully('unhandledRejection');
});

const start = async () => {
  try {
    server = await buildApp();
    
    await server.listen({ 
      port: env.PORT, 
      host: env.HOST 
    });
    
    server.log.info(`Server listening on ${env.HOST}:${env.PORT}`);
    server.log.info(`Swagger documentation available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
