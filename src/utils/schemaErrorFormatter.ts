import { FastifySchemaValidationError } from 'fastify/types/schema';

const FRIENDLY_MESSAGES: Record<string, (err: FastifySchemaValidationError) => string> = {
  pattern: (err) => {
    const field = err.instancePath?.replace(/^\//, '');
    if (field?.includes('password')) {
      return 'Password must contain at least 8 characters, including uppercase, lowercase, and a number';
    }
    return 'Invalid format';
  },
  format: (err) => {
    if (err.params?.['format'] === 'email') {
      return 'Invalid email address';
    }
    return 'Invalid format';
  },
  minLength: (err) => `Must be at least ${err.params?.['limit']} characters`,
  maxLength: (err) => `Must be no more than ${err.params?.['limit']} characters`,
  required: (err) => `${err.params?.['missingProperty']} is required`,
  type: () => 'Invalid data type',
};

export function schemaErrorFormatter(errors: FastifySchemaValidationError[], dataVar: string): Error {
  const firstError = errors[0];
  if (!firstError) {
    return new Error('Validation failed');
  }

  const field = firstError.instancePath?.replace(/^\//, '') || dataVar;
  const formatter = FRIENDLY_MESSAGES[firstError.keyword];
  const message = formatter ? formatter(firstError) : (firstError.message || 'Validation failed');

  return new Error(`${field}: ${message}`);
}
