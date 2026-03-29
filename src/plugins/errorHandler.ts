import { FastifyError, FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  stack?: string;
}

const errorHandlerPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = (error as FastifyError & { statusCode?: number }).statusCode || 500;
    
    request.log.error({
      err: error,
      statusCode,
      url: request.url,
      method: request.method,
    });

    const response: ErrorResponse = {
      success: false,
      message: error.message || 'Internal Server Error',
      statusCode,
    };

    if (process.env['NODE_ENV'] === 'development' && error.stack) {
      response.stack = error.stack;
    }

    reply.code(statusCode).send(response);
  });
};

export default fp(errorHandlerPlugin);
