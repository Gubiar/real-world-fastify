import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";
import { unauthorized } from "../utils/response";
import { config } from "../config/env";

interface JWTPayload {
  userId: number;
  email: string;
  iss?: string;
  aud?: string;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

const jwtPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.register(fastifyJwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: config.jwtExpiresIn,
      iss: config.jwtIssuer,
      aud: config.jwtAudience,
    },
    verify: {
      allowedIss: config.jwtIssuer,
      allowedAud: config.jwtAudience,
    },
  });

  server.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch {
        return unauthorized(reply, "Invalid or expired token");
      }
    },
  );
};

export default fp(jwtPlugin);
