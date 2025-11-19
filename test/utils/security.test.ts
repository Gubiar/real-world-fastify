import { test, expect, describe } from '@jest/globals';
import { 
  hashPassword, 
  verifyPassword, 
  timingSafeEqual, 
  sanitizeEmail, 
  isStrongPassword 
} from '../../src/utils/security';

describe('Security Utils', () => {
  describe('hashPassword', () => {
    test('should hash password', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });
    
    test('should generate different hashes for same password', async () => {
      const password = 'Password123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });
  
  describe('verifyPassword', () => {
    test('should verify correct password', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });
    
    test('should reject incorrect password', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('WrongPassword', hash);
      
      expect(isValid).toBe(false);
    });
    
    test('should handle malformed hash gracefully', async () => {
      const isValid = await verifyPassword('Password123', 'invalid-hash');
      
      expect(isValid).toBe(false);
    });
  });
  
  describe('timingSafeEqual', () => {
    test('should return true for equal strings', async () => {
      const result = await timingSafeEqual('test123', 'test123');
      
      expect(result).toBe(true);
    });
    
    test('should return false for different strings', async () => {
      const result = await timingSafeEqual('test123', 'test456');
      
      expect(result).toBe(false);
    });
    
    test('should return false for strings of different lengths', async () => {
      const result = await timingSafeEqual('test', 'testing');
      
      expect(result).toBe(false);
    });
    
    test('should be case-sensitive', async () => {
      const result = await timingSafeEqual('Test', 'test');
      
      expect(result).toBe(false);
    });
    
    test('should handle empty strings', async () => {
      expect(await timingSafeEqual('', '')).toBe(true);
      expect(await timingSafeEqual('test', '')).toBe(false);
      expect(await timingSafeEqual('', 'test')).toBe(false);
    });
    
    test('should take constant time regardless of length difference', async () => {
      const secret = 'very-long-secret-key-here';
      
      const start1 = Date.now();
      await timingSafeEqual('a', secret);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      await timingSafeEqual('very-long-wrong-key-here', secret);
      const time2 = Date.now() - start2;
      
      expect(Math.abs(time1 - time2)).toBeLessThan(5);
    });
  });
  
  describe('sanitizeEmail', () => {
    test('should convert email to lowercase', () => {
      const email = sanitizeEmail('Test@EXAMPLE.COM');
      
      expect(email).toBe('test@example.com');
    });
    
    test('should trim whitespace', () => {
      const email = sanitizeEmail('  test@example.com  ');
      
      expect(email).toBe('test@example.com');
    });
    
    test('should handle both trim and lowercase', () => {
      const email = sanitizeEmail('  Test@EXAMPLE.COM  ');
      
      expect(email).toBe('test@example.com');
    });
  });
  
  describe('isStrongPassword', () => {
    test('should accept strong password with special char', () => {
      expect(isStrongPassword('Pass123!')).toBe(true);
    });
    
    test('should accept strong password with 8+ chars and special char', () => {
      expect(isStrongPassword('Pass123#')).toBe(true);
    });
    
    test('should accept long password without special char', () => {
      expect(isStrongPassword('Password12345678')).toBe(true);
    });
    
    test('should reject password without special char and less than 12 chars', () => {
      expect(isStrongPassword('Password123')).toBe(false);
    });
    
    test('should reject password without uppercase', () => {
      expect(isStrongPassword('password123!')).toBe(false);
    });
    
    test('should reject password without lowercase', () => {
      expect(isStrongPassword('PASSWORD123!')).toBe(false);
    });
    
    test('should reject password without numbers', () => {
      expect(isStrongPassword('PasswordABC!')).toBe(false);
    });
    
    test('should reject password too short', () => {
      expect(isStrongPassword('Pass1!')).toBe(false);
    });
    
    test('should reject empty password', () => {
      expect(isStrongPassword('')).toBe(false);
    });
  });
});

