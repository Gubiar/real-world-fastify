import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyRequest,
  RouteOptions,
} from "fastify";
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import { config } from "../config/env";

const rateLimitPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  await server.register(rateLimit, {
    global: false,
    max: config.rateLimitMax,
    timeWindow: config.rateLimitWindow,
    cache: 10000,
    keyGenerator: (request: FastifyRequest) => request.ip,
  });

  server.addHook("onRoute", (routeOptions: RouteOptions) => {
    if (
      routeOptions.url &&
      (routeOptions.url.includes("/api/auth/login") ||
        routeOptions.url.includes("/api/auth/register"))
    ) {
      routeOptions.config = {
        ...(routeOptions.config || {}),
        rateLimit: {
          max: config.rateLimitAuthMax,
          timeWindow: config.rateLimitAuthWindow,
        },
      } as NonNullable<RouteOptions["config"]>;
    }
  });
};

export default fp(rateLimitPlugin);
