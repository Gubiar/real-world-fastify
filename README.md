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
- GitHub Actions CI (lint, test, audit)

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
    database.ts
    httpStatusCodes.ts
    response.ts
    schemaErrorFormatter.ts
scripts/
  run-tests.ts
test/
  auth/
    auth.test.ts
  config/
    env.test.ts
  setup.ts
.github/
  workflows/
    ci.yml
```

## Requisitos

- Node.js 22+
- pnpm
- Docker (para testes e ambiente local)
- PostgreSQL 16+ (provisionado via Docker ou externo)

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

## Segurança e produção

- `JWT_SECRET` precisa ter no mínimo 32 caracteres fora de `test`.
- `JWT_ISSUER` e `JWT_AUDIENCE` são validados na assinatura e verificação do token. Defaults: `real-world-fastify` e `real-world-fastify-users`.
- Em produção, `CORS_ORIGIN` deve ser uma allowlist explícita (sem `*`).
- Em produção, `ENABLE_DOCS` é desabilitado por padrão.
- `TRUST_PROXY` deve ser `true` quando a aplicação rodar atrás de reverse proxy (Nginx, Cloudflare, ALB). Afeta `request.ip` e rate limit.
- `BCRYPT_ROUNDS` é configurável via env (default `10`). Aumentar em produção conforme capacidade do hardware.
- `RUN_MIGRATIONS_ON_STARTUP` é `true` por padrão no Docker Compose para facilitar setup local. Em produção, desabilite e rode migrations em job dedicado antes do deploy.
- Emails são normalizados para lowercase na criação e busca de usuários.
- Login usa comparação timing-safe: tempo de resposta é constante independentemente de o email existir ou não, prevenindo enumeração de usuários por timing attack.
- Registro é race-condition safe: usa insert direto com captura de violação de unique constraint (409 Conflict), eliminando TOCTOU.
- Rate limit global aplicado a todas as rotas. Endpoints de auth (`/login`, `/register`) possuem limites mais restritivos configurados por rota.
- Content Security Policy (CSP) do Helmet é habilitada em produção (quando `ENABLE_DOCS=false`). Em desenvolvimento, CSP é desabilitada para compatibilidade com Swagger UI.
- O seed (`db:seed`) possui guard contra execução em produção.
- O endpoint `/me` consulta o banco para retornar dados atualizados do usuário, garantindo que tokens de usuários deletados sejam rejeitados.

## Variáveis de ambiente

| Variável | Obrigatória | Default | Descrição |
|---|---|---|---|
| `NODE_ENV` | Não | `development` | `development`, `test` ou `production` |
| `PORT` | Não | `3000` | Porta do servidor |
| `HOST` | Não | `0.0.0.0` | Host de bind |
| `DATABASE_URL` | Sim | — | Connection string PostgreSQL |
| `JWT_SECRET` | Sim | — | Segredo JWT (min 32 chars fora de test) |
| `JWT_EXPIRES_IN` | Não | `1d` | Tempo de expiração do token |
| `JWT_ISSUER` | Não | `real-world-fastify` | Issuer do JWT |
| `JWT_AUDIENCE` | Não | `real-world-fastify-users` | Audience do JWT |
| `CORS_ORIGIN` | Não | `*` (dev) | Origens permitidas (comma-separated) |
| `ENABLE_DOCS` | Não | `true` (dev) / `false` (prod) | Habilita Swagger UI em `/docs` |
| `RUN_MIGRATIONS_ON_STARTUP` | Não | `true` (dev) / `false` (prod) | Roda migrations ao iniciar |
| `TRUST_PROXY` | Não | `false` | Habilita trust proxy no Fastify |
| `LOG_LEVEL` | Não | `info` | Nível de log Pino |
| `BCRYPT_ROUNDS` | Não | `10` | Rounds de hash bcrypt |
| `RATE_LIMIT_MAX` | Não | `100` | Requisições por janela (global) |
| `RATE_LIMIT_WINDOW` | Não | `1 minute` | Janela de rate limit global |
| `RATE_LIMIT_AUTH_MAX` | Não | `5` | Requisições por janela (auth) |
| `RATE_LIMIT_AUTH_WINDOW` | Não | `1 minute` | Janela de rate limit auth |

## Scripts

- `pnpm dev`: desenvolvimento com watch
- `pnpm build`: build TypeScript
- `pnpm start`: inicia build de produção
- `pnpm lint`: lint do projeto
- `pnpm lint:fix`: lint com autofix
- `pnpm format`: formata código
- `pnpm format:check`: valida formatação
- `pnpm test`: sobe container Postgres efêmero, aplica migrations, roda jest e limpa o container (requer Docker)
- `pnpm test:watch`: jest em modo watch (requer banco rodando)
- `pnpm test:coverage`: cobertura de testes
- `pnpm db:generate`: gera migration Drizzle
- `pnpm db:migrate`: aplica migrations
- `pnpm db:push`: aplica schema sem migration
- `pnpm db:studio`: abre Drizzle Studio
- `pnpm db:seed`: popula dados de exemplo

## Docker

O `docker-compose.yml` constrói a `DATABASE_URL` automaticamente a partir de `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`, usando o hostname interno do serviço (`db`). Não é necessário definir `DATABASE_URL` manualmente para Docker.

Migrations rodam automaticamente no startup (`RUN_MIGRATIONS_ON_STARTUP=true` por padrão no compose). Em produção, desabilite e rode em job dedicado antes do deploy.

Banco apenas (para desenvolvimento local com `pnpm dev`):

```bash
./deploy.sh --db-only
```

Aplicação completa (app + banco, ambiente similar a produção):

```bash
./deploy.sh --build
```

Parar tudo:

```bash
./deploy.sh --down
```

Para customizar credenciais ou habilitar Swagger UI, ajuste as variáveis no `.env`:

```env
POSTGRES_USER=app_user
POSTGRES_PASSWORD=strong_db_password
POSTGRES_DB=app_db
JWT_SECRET=replace_with_32_plus_characters_secret
CORS_ORIGIN=https://api.example.com,https://admin.example.com
ENABLE_DOCS=true
```

Para executar migrations em produção, rode um job dedicado:

```bash
pnpm db:migrate
```

## CI

A pipeline GitHub Actions (`.github/workflows/ci.yml`) roda em push e PR na branch `master` com 3 jobs paralelos:

- **lint**: `pnpm lint` + `pnpm format:check`
- **test**: Postgres via service container, `pnpm db:migrate` + `jest`
- **audit**: `pnpm audit --prod` para vulnerabilidades em dependências

## Padrões do projeto

- Arquitetura por módulo (`route`, `controller`, `service`, `schema`)
- Respostas padronizadas via `utils/response.ts`: sucesso retorna `{ success, data }`, erro retorna `{ success, message, statusCode }`
- Erros de domínio com `AppError` (mensagem exposta ao cliente apenas para status < 500)
- Configuração centralizada e tipada em `config/env.ts`
- Type-safety sem `any` nos pontos críticos
- Emails normalizados para lowercase na camada de dados
- Graceful shutdown com tratamento de `SIGINT`, `SIGTERM`, `uncaughtException` e `unhandledRejection`
- `trustProxy` configurável via env para ambientes com reverse proxy

## Testes

`pnpm test` é auto-suficiente: o script `scripts/run-tests.ts` sobe um container Postgres efêmero com porta aleatória, aplica migrations, executa jest e remove o container no final. Requer Docker rodando.

Os testes usam `buildApp()` e `app.inject()` sem subir servidor HTTP externo. O arquivo `test/setup.ts` configura variáveis de ambiente para o ambiente de teste.

Para rodar jest manualmente contra um banco já existente:

```bash
DATABASE_URL=postgresql://... pnpm exec jest
```
