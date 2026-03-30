import { FastifyReply, FastifyRequest } from "fastify";
import { LoginInputType, RegisterInputType } from "./auth.schema";
import { validateUser, generateJwt, registerUser } from "./auth.service";
import { HttpStatus } from "../../utils/httpStatusCodes";
import { error, success, unauthorized } from "../../utils/response";
import { sanitizeUser, findById } from "../users/user.service";

export async function registerHandler(
  request: FastifyRequest<{ Body: RegisterInputType }>,
  reply: FastifyReply,
) {
  const user = await registerUser(request.server, request.body);
  return success(reply, sanitizeUser(user), HttpStatus.CREATED);
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInputType }>,
  reply: FastifyReply,
) {
  const { email, password } = request.body;
  const user = await validateUser(request.server, email, password);
  if (!user) {
    return error(reply, "Invalid email or password", HttpStatus.UNAUTHORIZED);
  }
  const token = generateJwt(request.server, {
    userId: user.id,
    email: user.email,
  });
  return success(reply, { token, user: sanitizeUser(user) });
}

export async function meHandler(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user;
  const user = await findById(request.server, userId);
  if (!user) {
    return unauthorized(reply, "User no longer exists");
  }
  return success(reply, sanitizeUser(user));
}
