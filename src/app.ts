import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import jwtPlugin from './plugins/jwt';
import errorHandler from './plugins/errorHandler';
import rateLimitPlugin from './plugins/rateLimit';
import { authRoutes } from './modules/auth/auth.route';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { disconnectPrisma } from './utils/prisma';

// Load environment variables
dotenv.config();

// Validate critical environment variables in production
if (process.env['NODE_ENV'] === 'production') {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }
}

// Create Fastify server
const server = fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>();

// Register error handler (should be first)
server.register(errorHandler);

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

// Register security plugins
server.register(helmet, {
  global: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
    }
  }
});

server.register(cors, {
  origin: process.env['CORS_ORIGIN'] || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

// Register rate limiting
server.register(rateLimitPlugin);

// Register JWT plugin
server.register(jwtPlugin);

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  server.log.info(`Received signal ${signal}, shutting down...`);
  
  await server.close();
  await disconnectPrisma();
  
  process.exit(0);
};

// Listen for signals
process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));
process.on('uncaughtException', (error) => {
  server.log.error(error, 'Uncaught exception');
  closeGracefully('uncaughtException');
});

// Run the server
const start = async () => {
  try {
    const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
    const host = process.env['HOST'] || '0.0.0.0';
    
    await server.listen({ port, host });
    
    server.log.info(`Server listening on ${host}:${port}`);
    server.log.info(`Swagger documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 