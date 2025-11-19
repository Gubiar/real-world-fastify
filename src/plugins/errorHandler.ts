import { FastifyError, FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ErrorResponse } from '../types/common';
import { AppError } from '../utils/errors';
import { isDevelopment } from '../config/env';

const errorHandlerPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.setErrorHandler((error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
    const isAppError = error instanceof AppError;
    const statusCode = error.statusCode || 500;
    
    const shouldLog = !isAppError || !error.isOperational;
    
    if (shouldLog) {
      request.log.error({
        err: error,
        statusCode,
        url: request.url,
        method: request.method,
        body: request.body,
      });
    } else {
      request.log.info({
        message: error.message,
        statusCode,
        url: request.url,
        method: request.method,
      });
    }

    const response: ErrorResponse = {
      success: false,
      message: isAppError ? error.message : 'Internal Server Error',
      statusCode,
    };

    if (isDevelopment && error.stack) {
      response.stack = error.stack;
    }

    reply.code(statusCode).send(response);
  });
};

export default fp(errorHandlerPlugin);
