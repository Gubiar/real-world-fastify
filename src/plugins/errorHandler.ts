import { FastifyError, FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { config } from '../config/env';

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
      message: statusCode >= 500 ? 'Internal Server Error' : (error.message || 'Request failed'),
      statusCode,
    };

    if (config.nodeEnv === 'development' && statusCode < 500 && error.stack) {
      response.stack = error.stack;
    }

    reply.code(statusCode).send(response);
  });
};

export default fp(errorHandlerPlugin);
