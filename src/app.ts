import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { sql } from "drizzle-orm";
import jwtPlugin from "./plugins/jwt";
import errorHandler from "./plugins/errorHandler";
import rateLimitPlugin from "./plugins/rateLimit";
import drizzlePlugin from "./plugins/drizzle";
import { registerAuthRoutes } from "./modules/auth/auth.route";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { schemaErrorFormatter } from "./utils/schemaErrorFormatter";
import { config } from "./config/env";

export function buildApp() {
  const server = fastify({
    trustProxy: config.trustProxy,
    logger: {
      level: config.logLevel,
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          'req.headers["set-cookie"]',
          'req.headers["x-api-key"]',
          'req.headers["x-auth-token"]',
        ],
        censor: "[Redacted]",
      },
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            parameters: request.params,
            headers: {
              host: request.headers.host,
              "user-agent": request.headers["user-agent"],
              origin: request.headers.origin,
              "x-forwarded-for": request.headers["x-forwarded-for"],
            },
          };
        },
      },
      ...(config.nodeEnv !== "production"
        ? {
            transport: {
              target: "pino-pretty",
              options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            },
          }
        : {}),
    },
    schemaErrorFormatter,
  }).withTypeProvider<TypeBoxTypeProvider>();

  server.register(errorHandler);
  server.register(drizzlePlugin);

  server.register(swagger, {
    openapi: {
      info: {
        title: "Fastify API",
        description:
          "Fastify API with TypeScript, Drizzle ORM, and JWT authentication",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  if (config.enableDocs) {
    server.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: false,
      },
    });
  }

  server.register(helmet, {
    global: true,
    ...(config.enableDocs && { contentSecurityPolicy: false }),
  });

  server.register(cors, {
    origin: config.corsOrigin,
    credentials: config.corsOrigin !== true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  server.register(rateLimitPlugin);
  server.register(jwtPlugin);
  registerAuthRoutes(server, "/api/auth");

  server.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  server.get("/health", async (_request, reply) => {
    try {
      await server.db.execute(sql`SELECT 1`);
      return { status: "ok" };
    } catch {
      return reply.code(503).send({ status: "unhealthy" });
    }
  });

  return server;
}
