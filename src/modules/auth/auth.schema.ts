import { Type, Static } from '@sinclair/typebox';

export const RegisterInput = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  name: Type.String()
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
  email: Type.String({ format: 'email' }),
  password: Type.String()
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