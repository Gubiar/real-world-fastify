import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type ConnectionOptions = {
  logger?: boolean;
  poolMax?: number;
};

export function createDbConnection(
  connectionString: string,
  options: ConnectionOptions = {},
) {
  const client = postgres(connectionString, {
    max: options.poolMax ?? 10,
  });

  return drizzle(client, {
    schema,
    logger: options.logger ?? false,
  });
}

export type DbConnection = ReturnType<typeof createDbConnection>;
