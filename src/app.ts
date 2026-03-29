import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwtPlugin from './plugins/jwt';
import errorHandler from './plugins/errorHandler';
import rateLimitPlugin from './plugins/rateLimit';
import drizzlePlugin from './plugins/drizzle';
import { registerAuthRoutes } from './modules/auth/auth.route';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { schemaErrorFormatter } from './utils/schemaErrorFormatter';
import { config } from './config/env';

export function buildApp() {
  const server = fastify({
    logger: {
      level: config.logLevel,
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
      ...(config.nodeEnv !== 'production'
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
              }
            }
          }
        : {})
    },
    schemaErrorFormatter
  }).withTypeProvider<TypeBoxTypeProvider>();

  server.register(errorHandler);
  server.register(drizzlePlugin);

  server.register(swagger, {
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

  server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  server.register(helmet, {
    global: true,
    contentSecurityPolicy: false
  });

  server.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  });

  server.register(rateLimitPlugin);
  server.register(jwtPlugin);
  registerAuthRoutes(server, '/api/auth');

  server.get('/health', async () => ({ status: 'ok' }));

  return server;
}