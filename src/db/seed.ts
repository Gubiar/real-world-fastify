import dotenv from 'dotenv';
import { createDbConnection } from './connection';
import { users } from './schema';
import * as bcrypt from 'bcrypt';

dotenv.config();

async function seed() {
  const databaseUrl = process.env['DATABASE_URL'];
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const db = createDbConnection(databaseUrl, true);

  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  await db.insert(users).values([
    {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
    {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
    },
  ]);

  console.log('Database seeded successfully!');

  await db.$client.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

