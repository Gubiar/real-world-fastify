import { FastifyReply } from 'fastify';
import { HttpStatus } from './httpStatusCodes';
import { SuccessResponse, ErrorResponse } from '../types/common';

export function success<T>(
  reply: FastifyReply, 
  data: T, 
  status: number = HttpStatus.OK
): FastifyReply {
  const response: SuccessResponse<T> = { success: true, data };
  return reply.code(status).send(response);
}

export function error(
  reply: FastifyReply, 
  message: string, 
  status: number = HttpStatus.INTERNAL_ERROR
): FastifyReply {
  const response: ErrorResponse = { 
    success: false, 
    message,
    statusCode: status 
  };
  return reply.code(status).send(response);
}

export function unauthorized(
  reply: FastifyReply, 
  message: string = 'Unauthorized'
): FastifyReply {
  return error(reply, message, HttpStatus.UNAUTHORIZED);
}

export function forbidden(
  reply: FastifyReply, 
  message: string = 'Forbidden'
): FastifyReply {
  return error(reply, message, HttpStatus.FORBIDDEN);
}

export function notFound(
  reply: FastifyReply, 
  message: string = 'Resource not found'
): FastifyReply {
  return error(reply, message, HttpStatus.NOT_FOUND);
} 