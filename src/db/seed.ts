import { createDbConnection } from './connection';
import { UserRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/security';

async function seed() {
  const db = createDbConnection({ logger: true });
  const userRepository = new UserRepository(db);

  console.log('Seeding database...');

  const hashedPassword = await hashPassword('Password123!');

  try {
    await userRepository.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    });

    await userRepository.create({
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await db.$client.end();
  }
  
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

