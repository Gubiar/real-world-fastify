# Real-World Fastify Boilerplate

Boilerplate de back-end com Fastify + TypeScript + Drizzle ORM, com foco em base limpa, segura e pronta para evoluir.

## Stack

- Fastify 5
- TypeScript strict
- Drizzle ORM + PostgreSQL
- TypeBox para validação de payload
- JWT com `@fastify/jwt`
- Jest para testes de integração
- Docker e Docker Compose

## Estrutura

```text
src/
  app.ts
  server.ts
  config/
    env.ts
  db/
    connection.ts
    schema.ts
    migrations/
    seed.ts
  modules/
    auth/
      auth.controller.ts
      auth.route.ts
      auth.schema.ts
      auth.service.ts
    users/
      user.service.ts
  plugins/
    drizzle.ts
    errorHandler.ts
    jwt.ts
    rateLimit.ts
  utils/
    appError.ts
    httpStatusCodes.ts
    response.ts
    schemaErrorFormatter.ts
test/
  auth/
    auth.test.ts
  setup.ts
```

## Requisitos

- Node.js 22+
- pnpm
- PostgreSQL 16+

## Setup local

1. Instale dependências:

```bash
pnpm install
```

2. Copie as variáveis:

```bash
cp sample.env .env
```

3. Ajuste o `DATABASE_URL` no `.env`.

4. Rode migrations:

```bash
pnpm db:migrate
```

5. Inicie em desenvolvimento:

```bash
pnpm dev
```

API em `http://localhost:3000`  
Docs em `http://localhost:3000/docs`

## Scripts

- `pnpm dev`: desenvolvimento com watch
- `pnpm build`: build TypeScript
- `pnpm start`: inicia build de produção
- `pnpm lint`: lint do projeto
- `pnpm lint:fix`: lint com autofix
- `pnpm format`: formata código
- `pnpm format:check`: valida formatação
- `pnpm test`: testes
- `pnpm test:coverage`: cobertura
- `pnpm db:generate`: gera migration Drizzle
- `pnpm db:migrate`: aplica migrations
- `pnpm db:push`: aplica schema sem migration
- `pnpm db:studio`: abre Drizzle Studio
- `pnpm db:seed`: popula dados de exemplo

## Docker

Banco apenas:

```bash
./deploy.sh --db-only
```

Aplicação + banco:

```bash
./deploy.sh --build
```

Parar tudo:

```bash
./deploy.sh --down
```

## Padrões do projeto

- Arquitetura por módulo (`route`, `controller`, `service`, `schema`)
- Respostas padronizadas em `utils/response.ts`
- Erros de domínio com `AppError`
- Configuração centralizada e tipada em `config/env.ts`
- Type-safety sem `any` nos pontos críticos

## Testes

Os testes usam a mesma configuração da app por `buildApp()` e executam com `app.inject()` sem subir servidor HTTP externo.
