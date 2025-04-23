# Fastify Authentication Boilerplate

A production-ready Fastify boilerplate with TypeScript, Prisma, JWT authentication, and Swagger documentation.

## Features

- Fastify web framework
- TypeScript with strict type checking
- Prisma ORM with PostgreSQL
- JWT authentication
- Request/response validation with TypeBox
- Swagger documentation
- Structured error handling

## Project Structure

```
src/
  modules/auth/
    auth.controller.ts
    auth.service.ts
    auth.schema.ts
    auth.route.ts
  plugins/
    jwt.ts
  utils/
    logger.ts
    httpStatusCodes.ts
    response.ts
prisma/
  schema.prisma
tsconfig.json
package.json
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp sample.env .env
```

Edit the `.env` file with your database connection string and JWT secret.

4. Set up the database

```bash
npx prisma migrate dev --name init
```

5. Start the development server

```bash
npm run dev
```

6. Access the Swagger documentation at http://localhost:3000/docs

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

## Development

### Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application
- `npm start` - Start the production server 