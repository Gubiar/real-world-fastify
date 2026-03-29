import {
  FastifyError,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import { config } from "../config/env";
import { AppError } from "../utils/appError";

interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  stack?: string;
}

function resolveMessage(error: Error, statusCode: number): string {
  if (statusCode >= 500) {
    return "Internal Server Error";
  }
  if (error instanceof AppError) {
    return error.message;
  }
  return error.message || "Request failed";
}

const errorHandlerPlugin: FastifyPluginAsync = async (
  server: FastifyInstance,
) => {
  server.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      const statusCode =
        error instanceof AppError
          ? error.statusCode
          : (error as FastifyError & { statusCode?: number }).statusCode || 500;

      request.log.error({
        err: error,
        statusCode,
        url: request.url,
        method: request.method,
      });

      const response: ErrorResponse = {
        success: false,
        message: resolveMessage(error, statusCode),
        statusCode,
      };

      if (config.nodeEnv === "development" && statusCode < 500 && error.stack) {
        response.stack = error.stack;
      }

      reply.code(statusCode).send(response);
    },
  );
};

export default fp(errorHandlerPlugin);
