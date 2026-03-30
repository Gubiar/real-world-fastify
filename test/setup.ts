import "dotenv/config";

process.env["NODE_ENV"] = "test";
process.env["LOG_LEVEL"] = "error";
process.env["JWT_SECRET"] = "test-jwt-secret-for-testing-only";
process.env["DATABASE_URL"] =
  process.env["DATABASE_URL"] ||
  "postgresql://postgres:postgres@localhost:5432/fastify_db";
process.env["RUN_MIGRATIONS_ON_STARTUP"] = "false";
process.env["RATE_LIMIT_MAX"] = "10000";
process.env["RATE_LIMIT_AUTH_MAX"] = "10000";
