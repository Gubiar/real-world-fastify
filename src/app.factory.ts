import fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import jwtPlugin from './plugins/jwt';
import errorHandler from './plugins/errorHandler';
import rateLimitPlugin from './plugins/rateLimit';
import drizzlePlugin from './plugins/drizzle';

import { registerAuthRoutes } from './modules/auth/auth.route';
import { schemaErrorFormatter } from './utils/schemaErrorFormatter';
import { env, isDevelopment } from './config/env';
import { helmetConfig, corsConfig } from './config/security';

export interface AppOptions {
  logger?: boolean;
  disableRequestLogging?: boolean;
}

export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const server = fastify({
    logger: options.logger !== false ? {
      level: env.LOG_LEVEL,
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            parameters: request.params,
            headers: {
              ...request.headers,
              authorization: request.headers.authorization ? '[Redacted]' : undefined
            }
          };
        }
      },
      ...(isDevelopment ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
          }
        }
      } : {})
    } : false,
    disableRequestLogging: options.disableRequestLogging ?? false,
    schemaErrorFormatter
  }).withTypeProvider<TypeBoxTypeProvider>();

  await server.register(errorHandler);
  await server.register(drizzlePlugin);

  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Fastify API',
        description: 'Fastify API with TypeScript, Drizzle ORM, and JWT authentication',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  await server.register(helmet, helmetConfig);
  await server.register(cors, corsConfig);
  await server.register(rateLimitPlugin);
  await server.register(jwtPlugin);

  registerAuthRoutes(server, '/api/auth');

  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return server;
}

