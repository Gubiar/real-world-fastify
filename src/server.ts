import { buildApp } from './app';
import { config } from './config/env';

const server = buildApp();

const closeGracefully = async (signal: string) => {
  server.log.info(`Received signal ${signal}, shutting down...`);
  await server.close();
  process.exit(0);
};

process.on('SIGINT', () => {
  void closeGracefully('SIGINT');
});

process.on('SIGTERM', () => {
  void closeGracefully('SIGTERM');
});

process.on('uncaughtException', (error) => {
  server.log.error(error, 'Uncaught exception');
  void closeGracefully('uncaughtException');
});

const start = async () => {
  try {
    await server.listen({ port: config.port, host: config.host });
    server.log.info(`Server listening on ${config.host}:${config.port}`);
    server.log.info(`Swagger documentation available at http://${config.host}:${config.port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
