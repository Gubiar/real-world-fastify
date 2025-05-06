import { PrismaClient } from '../../prisma/generated/client';

// Re-export User type from Prisma schema
export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
} 