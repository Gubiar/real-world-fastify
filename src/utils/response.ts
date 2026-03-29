import { FastifyReply } from 'fastify';
import { HttpStatus } from './httpStatusCodes';

export function success<T>(reply: FastifyReply, data: T, status = HttpStatus.OK) {
  return reply.code(status).send({ success: true, data });
}

export function error(reply: FastifyReply, message: string, status = HttpStatus.INTERNAL_ERROR) {
  return reply.code(status).send({ success: false, message, statusCode: status });
}

export function unauthorized(reply: FastifyReply, message = 'Unauthorized') {
  return error(reply, message, HttpStatus.UNAUTHORIZED);
} 