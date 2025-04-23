# Real-World Fastify Boilerplate

A production-ready Fastify boilerplate with TypeScript, Prisma, JWT authentication, and comprehensive testing. This project follows best practices for building secure, maintainable, and scalable REST APIs.

## Features

- **Fastify Web Framework**: High-performance Node.js framework
- **TypeScript**: With strict type checking and proper error handling
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **JWT Authentication**: Secure authentication with @fastify/jwt
- **Request Validation**: Using TypeBox for runtime validation
- **Swagger Documentation**: Interactive API documentation
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Using Helmet and proper CORS configuration
- **Error Handling**: Global error handler with proper responses
- **Testing**: Jest setup with example tests
- **Logging**: Advanced Pino logging with redaction
- **Code Structure**: Clear modular architecture
- **ESLint**: Modern linting setup

## Project Structure

```
├── src/
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.service.ts
│   │   ├── users/         # User management
│   │   │   └── user.service.ts
│   │   └── base.route.ts  # Base router class
│   ├── plugins/           # Fastify plugins
│   │   ├── jwt.ts         # JWT authentication
│   │   ├── errorHandler.ts # Global error handler
│   │   └── rateLimit.ts   # Rate limiting
│   ├── utils/             # Utility functions
│   │   ├── httpStatusCodes.ts
│   │   ├── logger.ts
│   │   ├── prisma.ts      # Prisma client
│   │   └── response.ts    # Response helpers
│   └── app.ts             # Application entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── test/                  # Tests
│   ├── auth/              # Auth tests
│   │   └── auth.test.ts
│   └── setup.ts           # Test setup
├── eslint.config.js       # ESLint configuration
├── jest.config.js         # Jest configuration
├── tsconfig.json          # TypeScript configuration
├── sample.env             # Environment variables example
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm/npm package manager
- PostgreSQL 13+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/real-world-fastify.git
cd real-world-fastify
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Set up environment variables:

```bash
cp sample.env .env
```

Edit the `.env` file with your configuration:

```
# Server configuration
PORT=3000
HOST="0.0.0.0"
NODE_ENV="development"

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fastify_db?schema=public"

# Authentication
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="1d"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Logging
LOG_LEVEL="info"
```

4. Set up the database:

```bash
# Create database migrations
pnpm db:migrate
# or
npm run db:migrate

# Optional: Seed the database
pnpm db:seed
# or
npm run db:seed
```

### Running the Application

#### Development Mode

```bash
pnpm dev
# or
npm run dev
```

This starts the server with hot reloading at http://localhost:3000.

#### Production Mode

```bash
# Build the application
pnpm build
# or
npm run build

# Start the production server
pnpm start
# or
npm start
```

### API Documentation

Swagger documentation is available at http://localhost:3000/docs when the server is running.

## Creating New Routes

The project follows a modular architecture where each feature has its own module. To create new routes:

1. **Create a new module directory** under `src/modules/your-feature/`.

2. **Create the schema file** with TypeBox schemas for request/response:

```typescript
// src/modules/your-feature/feature.schema.ts
import { Type, Static } from "@sinclair/typebox";

export const FeatureInput = Type.Object({
  property: Type.String(),
  // Define your properties
});

export type FeatureInputType = Static<typeof FeatureInput>;

export const FeatureResponse = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    // Define response properties
  }),
});
```

3. **Create a service** to handle business logic:

```typescript
// src/modules/your-feature/feature.service.ts
import { prisma } from "../../utils/prisma";

export class FeatureService {
  async someMethod() {
    // Implement your business logic
    return await prisma.someModel.findMany();
  }
}
```

4. **Create a controller** to handle requests:

```typescript
// src/modules/your-feature/feature.controller.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { FeatureService } from "./feature.service";
import { FeatureInputType } from "./feature.schema";
import { success, error } from "../../utils/response";
import { HttpStatus } from "../../utils/httpStatusCodes";

export class FeatureController {
  constructor(private featureService: FeatureService) {}

  async handleRequest(request: FastifyRequest<{ Body: FeatureInputType }>, reply: FastifyReply) {
    try {
      const result = await this.featureService.someMethod();
      return success(reply, result);
    } catch (err) {
      return error(reply, "Error message", HttpStatus.INTERNAL_ERROR);
    }
  }
}
```

5. **Create a router** extending BaseRouter:

```typescript
// src/modules/your-feature/feature.route.ts
import { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FeatureController } from "./feature.controller";
import { FeatureService } from "./feature.service";
import { FeatureInput, FeatureResponse } from "./feature.schema";
import { BaseRouter } from "../base.route";

export class FeatureRouter extends BaseRouter {
  private featureController: FeatureController;

  constructor() {
    super();
    const featureService = new FeatureService();
    this.featureController = new FeatureController(featureService);
  }

  async register(server: FastifyInstance): Promise<void> {
    const fastifyTypebox = server.withTypeProvider<TypeBoxTypeProvider>();

    fastifyTypebox.post(
      "/endpoint",
      {
        schema: {
          body: FeatureInput,
          response: {
            200: FeatureResponse,
          },
          description: "Endpoint description",
          tags: ["feature-tag"],
        },
      },
      this.featureController.handleRequest.bind(this.featureController)
    );

    // Add more routes as needed
  }
}

// Export a singleton instance
export const featureRouter = new FeatureRouter();
```

6. **Register your router** in `app.ts`:

```typescript
// In src/app.ts
import { featureRouter } from "./modules/your-feature/feature.route";

// Register routes
featureRouter.registerWithPrefix(server, "/api/your-feature");
```

## Testing

The project uses Jest for testing. Tests are located in the `test/` directory.

### Running Tests

```bash
# Run all tests
pnpm test
# or
npm test

# Run tests with coverage
pnpm test:coverage
# or
npm run test:coverage

# Run tests in watch mode during development
pnpm test:watch
# or
npm run test:watch
```

### Writing Tests

1. Create a new test file in the appropriate subdirectory under `test/`.
2. Follow the example in `test/auth/auth.test.ts`.
3. Use `app.inject()` for HTTP testing without starting a server.

Example:

```typescript
import { test, expect, describe, beforeAll, afterAll } from "@jest/globals";
import { FastifyInstance } from "fastify";
import fastify from "fastify";
import { yourRouter } from "../../src/modules/your-feature/feature.route";

describe("Your Feature", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = fastify();
    yourRouter.registerWithPrefix(app, "/api/your-feature");
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should perform an action", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/your-feature/endpoint",
      payload: {
        // Test data
      },
    });

    expect(response.statusCode).toBe(200);
    // More assertions
  });
});
```

## Security

This boilerplate includes several security features:

- **Password Hashing**: Using bcrypt with proper salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protect against brute force attacks
- **Helmet**: HTTP security headers
- **CORS**: Configured cross-origin resource sharing
- **Validation**: Request validation to prevent injections
- **Data Sanitization**: User data is sanitized before responses

## Deployment

For production deployment:

1. Set the `NODE_ENV` environment variable to `production`.
2. Ensure all sensitive environment variables are securely set.
3. Use a process manager like PM2 or run in a Docker container.
4. Set up a reverse proxy (Nginx, Apache) for production use.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Fastify team for the awesome framework
- Prisma team for the great ORM
- All the open-source contributors whose tools make this possible
