import dotenv from "dotenv";
import { createDbConnection } from "./connection";
import { users } from "./schema";
import bcrypt from "bcryptjs";

dotenv.config();

async function seed() {
  const databaseUrl = process.env["DATABASE_URL"];

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const db = createDbConnection(databaseUrl);

  const hashedPassword = await bcrypt.hash("Password123", 10);

  await db.insert(users).values([
    {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
    },
    {
      email: "user@example.com",
      password: hashedPassword,
      name: "Regular User",
    },
  ]);

  await db.$client.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
