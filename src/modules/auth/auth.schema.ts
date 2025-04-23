import { Type, Static } from '@sinclair/typebox';

// Password regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const RegisterInput = Type.Object({
  email: Type.String({ format: 'email', minLength: 5, maxLength: 255 }),
  password: Type.String({ 
    minLength: 8, 
    maxLength: 100,
    pattern: passwordRegex.source,
    description: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
  }),
  name: Type.String({ minLength: 2, maxLength: 100 })
});

export type RegisterInputType = Static<typeof RegisterInput>;

export const RegisterResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    id: Type.Number(),
    email: Type.String(),
    name: Type.String()
  })
});

export const LoginInput = Type.Object({
  email: Type.String({ format: 'email', minLength: 5, maxLength: 255 }),
  password: Type.String({ minLength: 8, maxLength: 100 })
});

export type LoginInputType = Static<typeof LoginInput>;

export const LoginResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    token: Type.String(),
    user: Type.Object({
      id: Type.Number(),
      email: Type.String(),
      name: Type.String()
    })
  })
}); 