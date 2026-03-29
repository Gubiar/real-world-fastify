import { Static } from "@sinclair/typebox";
import { RegisterInput } from "./auth.schema";
import { FastifyInstance } from "fastify";
import { findByEmail, create, comparePassword } from "../users/user.service";
import { User } from "../../db/schema";
import { AppError } from "../../utils/appError";
import { HttpStatus } from "../../utils/httpStatusCodes";

export async function registerUser(
  server: FastifyInstance,
  input: Static<typeof RegisterInput>,
): Promise<User> {
  const { email } = input;

  const existingUser = await findByEmail(server, email);

  if (existingUser) {
    throw new AppError(
      "User with this email already exists",
      HttpStatus.BAD_REQUEST,
    );
  }

  return create(server, input);
}

export async function validateUser(
  server: FastifyInstance,
  email: string,
  password: string,
): Promise<User | null> {
  const user = await findByEmail(server, email);

  if (!user) return null;

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
