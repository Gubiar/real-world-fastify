import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import jwtPlugin from './plugins/jwt';
import { authRoutes } from './modules/auth/auth.route';

// Load environment variables
dotenv.config();

// Create Fastify server
const server = fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>();

// Register Swagger
server.register(swagger, {
  openapi: {
    info: {
      title: 'Fastify API',
      description: 'Fastify API with TypeScript, Prisma, and JWT authentication',
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

// Register JWT plugin
server.register(jwtPlugin);

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Run the server
const start = async () => {
  try {
    const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
    const host = process.env['HOST'] || '0.0.0.0';
    
    await server.listen({ port, host });
    
    server.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 