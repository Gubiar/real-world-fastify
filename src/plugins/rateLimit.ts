import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import { config } from "../config/env";

const rateLimitPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  await server.register(rateLimit, {
    global: true,
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindow,
    cache: 10000,
    keyGenerator: (request: FastifyRequest) => request.ip,
  });
};

export default fp(rateLimitPlugin);
