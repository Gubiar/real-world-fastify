import postgres from "postgres";

const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(error: unknown): boolean {
  if (error instanceof postgres.PostgresError) {
    return error.code === UNIQUE_VIOLATION;
  }

  if (error instanceof Error && error.cause instanceof postgres.PostgresError) {
    return error.cause.code === UNIQUE_VIOLATION;
  }

  return false;
}
