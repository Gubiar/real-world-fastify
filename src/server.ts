import { buildApp } from './app';
import { config } from './config/env';

const server = buildApp();

const closeGracefully = async (signal: string, exitCode: number) => {
  server.log.info(`Received signal ${signal}, shutting down...`);
  await server.close();
  process.exit(exitCode);
};

process.on('SIGINT', () => {
  void closeGracefully('SIGINT', 0);
});

process.on('SIGTERM', () => {
  void closeGracefully('SIGTERM', 0);
});

process.on('uncaughtException', (error) => {
  server.log.error(error, 'Uncaught exception');
  void closeGracefully('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
  server.log.error(reason, 'Unhandled rejection');
  void closeGracefully('unhandledRejection', 1);
});

const start = async () => {
  try {
    await server.listen({ port: config.port, host: config.host });
    server.log.info(`Server listening on ${config.host}:${config.port}`);
    if (config.enableDocs) {
      server.log.info(`Swagger documentation available at http://${config.host}:${config.port}/docs`);
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
