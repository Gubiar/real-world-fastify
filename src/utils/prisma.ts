import { PrismaClient } from '@prisma/client';

// Create a singleton instance of the PrismaClient to be used across the app
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env['NODE_ENV'] === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// In development, don't create multiple connections
if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
} 