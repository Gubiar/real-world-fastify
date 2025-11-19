import * as bcrypt from 'bcrypt';
import { env } from '../config/env';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch {
    return false;
  }
}

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const aLen = a.length;
  const bLen = b.length;
  const maxLen = Math.max(aLen, bLen);
  
  let result = aLen ^ bLen;
  
  for (let i = 0; i < maxLen; i++) {
    const aChar = i < aLen ? a.charCodeAt(i) : 0;
    const bChar = i < bLen ? b.charCodeAt(i) : 0;
    result |= (aChar ^ bChar);
  }
  
  return result === 0;
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const hasBasicRequirements = 
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers;
  
  if (!hasBasicRequirements) {
    return false;
  }
  
  return hasSpecialChar || password.length >= 12;
}

