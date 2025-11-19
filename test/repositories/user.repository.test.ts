import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createDbConnection, DbConnection } from '../../src/db/connection';
import { UserRepository } from '../../src/repositories/user.repository';
import { users } from '../../src/db/schema';
import { hashPassword } from '../../src/utils/security';

describe('UserRepository', () => {
  let db: DbConnection;
  let repository: UserRepository;
  
  beforeAll(async () => {
    db = createDbConnection({ logger: false });
    repository = new UserRepository(db);
  });
  
  beforeEach(async () => {
    await db.delete(users);
  });
  
  afterAll(async () => {
    await db.$client.end();
  });
  
  describe('create', () => {
    test('should create a new user', async () => {
      const hashedPassword = await hashPassword('Password123');
      
      const user = await repository.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User'
      });
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.password).toBe(hashedPassword);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
    
    test('should normalize email to lowercase on create', async () => {
      const hashedPassword = await hashPassword('Password123');
      
      const user = await repository.create({
        email: 'TEST@EXAMPLE.COM',
        password: hashedPassword,
        name: 'Test User'
      });
      
      expect(user.email).toBe('test@example.com');
    });
  });
  
  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const hashedPassword = await hashPassword('Password123');
      await repository.create({
        email: 'find@example.com',
        password: hashedPassword,
        name: 'Find User'
      });
      
      const user = await repository.findByEmail('find@example.com');
      
      expect(user).toBeDefined();
      expect(user?.email).toBe('find@example.com');
    });
    
    test('should return undefined for non-existent email', async () => {
      const user = await repository.findByEmail('nonexistent@example.com');
      
      expect(user).toBeUndefined();
    });
    
    test('should find user with case-insensitive email', async () => {
      const hashedPassword = await hashPassword('Password123');
      await repository.create({
        email: 'case@example.com',
        password: hashedPassword,
        name: 'Case User'
      });
      
      const user = await repository.findByEmail('CASE@EXAMPLE.COM');
      
      expect(user).toBeDefined();
      expect(user?.email).toBe('case@example.com');
    });
  });
  
  describe('findById', () => {
    test('should find user by id', async () => {
      const hashedPassword = await hashPassword('Password123');
      const created = await repository.create({
        email: 'id@example.com',
        password: hashedPassword,
        name: 'ID User'
      });
      
      const user = await repository.findById(created.id);
      
      expect(user).toBeDefined();
      expect(user?.id).toBe(created.id);
      expect(user?.email).toBe('id@example.com');
    });
    
    test('should return undefined for non-existent id', async () => {
      const user = await repository.findById(99999);
      
      expect(user).toBeUndefined();
    });
  });
  
  describe('update', () => {
    test('should update user data', async () => {
      const hashedPassword = await hashPassword('Password123');
      const created = await repository.create({
        email: 'update@example.com',
        password: hashedPassword,
        name: 'Original Name'
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updated = await repository.update(created.id, {
        name: 'Updated Name'
      });
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.email).toBe('update@example.com');
    });
    
    test('should normalize email on update', async () => {
      const hashedPassword = await hashPassword('Password123');
      const created = await repository.create({
        email: 'original@example.com',
        password: hashedPassword,
        name: 'User'
      });
      
      const updated = await repository.update(created.id, {
        email: 'UPDATED@EXAMPLE.COM'
      });
      
      expect(updated?.email).toBe('updated@example.com');
    });
  });
  
  describe('delete', () => {
    test('should delete user', async () => {
      const hashedPassword = await hashPassword('Password123');
      const created = await repository.create({
        email: 'delete@example.com',
        password: hashedPassword,
        name: 'Delete User'
      });
      
      const deleted = await repository.delete(created.id);
      
      expect(deleted).toBe(true);
      
      const found = await repository.findById(created.id);
      expect(found).toBeUndefined();
    });
    
    test('should return false for non-existent user', async () => {
      const deleted = await repository.delete(99999);
      
      expect(deleted).toBe(false);
    });
  });
  
  describe('sanitizeUser', () => {
    test('should remove password from user object', async () => {
      const hashedPassword = await hashPassword('Password123');
      const user = await repository.create({
        email: 'sanitize@example.com',
        password: hashedPassword,
        name: 'Sanitize User'
      });
      
      const sanitized = repository.sanitizeUser(user);
      
      expect(sanitized.id).toBe(user.id);
      expect(sanitized.email).toBe(user.email);
      expect(sanitized.name).toBe(user.name);
      expect('password' in sanitized).toBe(false);
    });
  });
});

