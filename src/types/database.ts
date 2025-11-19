import { User } from '../db/schema';

export type UserWithoutPassword = Omit<User, 'password'>;

export interface DatabaseConfig {
  url: string;
  poolMin: number;
  poolMax: number;
  idleTimeout: number;
  connectionTimeout: number;
  logger: boolean;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
}

