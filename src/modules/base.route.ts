import { FastifyInstance } from 'fastify';

/**
 * Base router class that should be extended by all route handlers
 * to ensure consistent API structure and organization
 */
export abstract class BaseRouter {
  /**
   * Register all routes for this module
   * @param server Fastify server instance
   */
  abstract register(server: FastifyInstance): Promise<void> | void;
  
  /**
   * Register routes with an optional prefix
   * @param server Fastify server instance
   * @param options Options for route registration
   */
  registerWithPrefix(
    server: FastifyInstance, 
    prefix: string
  ): void {
    server.register(
      async (instance) => {
        await Promise.resolve(this.register(instance));
      },
      { prefix }
    );
  }
} 