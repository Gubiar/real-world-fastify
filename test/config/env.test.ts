import { createRequire } from "node:module";
import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

const requireEnv = createRequire(__filename);

const originalEnv = { ...process.env };

describe("Environment security rules", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("should require strong JWT secret in production", () => {
    process.env["NODE_ENV"] = "production";
    process.env["DATABASE_URL"] =
      "postgresql://dbuser:dbpass@localhost:5432/app";
    process.env["JWT_SECRET"] = "short-secret";
    process.env["CORS_ORIGIN"] = "https://example.com";

    expect(() => {
      requireEnv("../../src/config/env");
    }).toThrow("JWT_SECRET must have at least 32 characters");
  });

  test("should reject wildcard CORS in production", () => {
    process.env["NODE_ENV"] = "production";
    process.env["DATABASE_URL"] =
      "postgresql://dbuser:dbpass@localhost:5432/app";
    process.env["JWT_SECRET"] = "12345678901234567890123456789012";
    process.env["CORS_ORIGIN"] = "*";

    expect(() => {
      requireEnv("../../src/config/env");
    }).toThrow("CORS_ORIGIN wildcard is not allowed in production");
  });

  test("should disable docs by default in production", () => {
    process.env["NODE_ENV"] = "production";
    process.env["DATABASE_URL"] =
      "postgresql://dbuser:dbpass@localhost:5432/app";
    process.env["JWT_SECRET"] = "12345678901234567890123456789012";
    process.env["CORS_ORIGIN"] = "https://example.com";
    process.env["ENABLE_DOCS"] = "";

    const module = requireEnv("../../src/config/env") as {
      config: { enableDocs: boolean };
    };
    expect(module.config.enableDocs).toBe(false);
  });
});
