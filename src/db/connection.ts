import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function createDbConnection(
  connectionString: string,
  logger: boolean = false,
) {
  const client = postgres(connectionString, {
    max: 10,
  });

  return drizzle(client, {
    schema,
    logger: logger,
  });
}

export type DbConnection = ReturnType<typeof createDbConnection>;
