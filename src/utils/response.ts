import { FastifyReply } from 'fastify';
import { HttpStatus } from './httpStatusCodes';

export function success(reply: FastifyReply, data: any, status = HttpStatus.OK) {
  return reply.code(status).send({ success: true, data });
}

export function error(reply: FastifyReply, message: string, status = HttpStatus.INTERNAL_ERROR) {
  return reply.code(status).send({ success: false, message });
}

export function unauthorized(reply: FastifyReply, message = 'Unauthorized') {
  return error(reply, message, HttpStatus.UNAUTHORIZED);
} 