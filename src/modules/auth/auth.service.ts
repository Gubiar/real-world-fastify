import { Static } from "@sinclair/typebox";
import { RegisterInput } from "./auth.schema";
import { FastifyInstance } from "fastify";
import { findByEmail, create, comparePassword } from "../users/user.service";
import { User } from "../../db/schema";
import { AppError } from "../../utils/appError";
import { HttpStatus } from "../../utils/httpStatusCodes";
import { isUniqueViolation } from "../../utils/database";

const DUMMY_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function registerUser(
  server: FastifyInstance,
  input: Static<typeof RegisterInput>,
): Promise<User> {
  try {
    return await create(server, input);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError("Email is already in use", HttpStatus.CONFLICT);
    }
    throw err;
  }
}

export async function validateUser(
  server: FastifyInstance,
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findByEmail(server, email);

  if (!user) {
    await comparePassword(password, DUMMY_HASH);
    return null;
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) return null;

  return user;
}

export function generateJwt(
  server: FastifyInstance,
  payload: { userId: number; email: string },
): string {
  return server.jwt.sign(payload);
}
