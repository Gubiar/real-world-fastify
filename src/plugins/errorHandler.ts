import { FastifyError, FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { HttpStatus } from '../utils/httpStatusCodes';

interface ErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
  stack?: string | undefined;
}

const errorHandler: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // Log the error
    request.log.error(error);
    
    // Prepare error response
    const response: ErrorResponse = {
      success: false,
      message: error.message || 'Internal Server Error',
      statusCode: error.statusCode || HttpStatus.INTERNAL_ERROR
    };
    
    // Add stack trace in development mode
    if (process.env['NODE_ENV'] === 'development' && error.stack) {
      response.stack = error.stack;
    }

    // Send error response
    reply
      .code(response.statusCode)
      .send(response);
  });
};

export default fp(errorHandler); 