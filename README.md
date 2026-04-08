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
- GitHub Actions CI (lint, test, audit, docker)

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
Dockerfile
docker-compose.yml
docker-compose.development.yml
deploy.sh
run-db.sh
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

PowerShell: `Copy-Item sample.env .env`

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
- No `docker-compose.yml`, `RUN_MIGRATIONS_ON_STARTUP` e `ENABLE_DOCS` têm valores fixos (`true` e `false`) para não serem sobrescritos por variáveis globais do sistema. Em deploy real, desabilite migrations no startup e rode-as em job dedicado; use `docker-compose.override.yml` (gitignored) se precisar ajustar o Compose localmente.
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
| `ENABLE_DOCS` | Não | `true` (dev) / `false` (prod) | Habilita Swagger UI em `/docs` (no `docker-compose.yml` do repo o valor é `false` fixo; `docker-compose.development.yml` usa `true`) |
| `RUN_MIGRATIONS_ON_STARTUP` | Não | `true` (dev) / `false` (prod) | Roda migrations ao iniciar (no `docker-compose.yml` do repo o valor é `true` fixo) |
| `TRUST_PROXY` | Não | `false` | Habilita trust proxy no Fastify |
| `LOG_LEVEL` | Não | `info` | Nível de log Pino |
| `BCRYPT_ROUNDS` | Não | `10` | Rounds de hash bcrypt |
| `RATE_LIMIT_MAX` | Não | `100` | Requisições por janela (global) |
| `RATE_LIMIT_WINDOW` | Não | `1 minute` | Janela de rate limit global |
| `RATE_LIMIT_AUTH_MAX` | Não | `5` | Requisições por janela (auth) |
| `RATE_LIMIT_AUTH_WINDOW` | Não | `1 minute` | Janela de rate limit auth |
| `DB_POOL_MAX` | Não | `10` | Tamanho máximo do pool de conexões PostgreSQL |

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
- `pnpm docker:up` / `pnpm docker:up:dev` / `pnpm docker:down` / `pnpm docker:db`: Compose seguro, Compose com Postgres em localhost, parar stack, só banco com porta local

## Docker

O `docker compose` lê o arquivo `.env` na raiz do projeto para interpolar variáveis. Defina `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` e `JWT_SECRET` (mínimo 32 caracteres) no `.env` (pode partir do `sample.env`). O serviço `app` recebe `DATABASE_URL` montada a partir desses dados com hostname interno `db`; não é necessário repetir `DATABASE_URL` no `.env` para a stack Docker.

Por padrão o PostgreSQL **não** publica porta no host: só o container da API na rede `app-network` alcança o banco. O `docker-compose.yml` fixa `ENABLE_DOCS=false` e `RUN_MIGRATIONS_ON_STARTUP=true` no serviço `app`. O arquivo `docker-compose.development.yml` expõe `127.0.0.1:5432` no Postgres e define `ENABLE_DOCS=true` no `app` para uma stack mais próxima do dia a dia de desenvolvimento.

Migrations rodam no startup neste Compose por padrão. Em produção, desabilite migrations no startup (override ou orquestrador) e rode-as em job dedicado antes do deploy.

Banco apenas com porta local (para desenvolvimento com `pnpm dev`):

```bash
./deploy.sh --db-only
```

Aplicação completa sem expor o banco ao host (recomendado para produção / homologação segura):

```bash
./deploy.sh --build
```

Mesma stack com PostgreSQL em `127.0.0.1:5432`:

```bash
./deploy.sh --build --dev
```

Equivalente com pnpm: `pnpm docker:up` (seguro) e `pnpm docker:up:dev` (Postgres em localhost + Swagger habilitado no container).

Parar tudo:

```bash
./deploy.sh --down
```

O script `deploy.sh` é Bash (Git Bash ou WSL no Windows). No PowerShell use os comandos `pnpm docker:*` acima.

Credenciais e `JWT_SECRET` vão no `.env`. Senhas com caracteres especiais na URL do Postgres devem ser codificadas (percent-encoding) se você montar `DATABASE_URL` manualmente; para Compose, use senhas alfanuméricas nos campos `POSTGRES_*` ou consulte a documentação do PostgreSQL sobre connection URIs.

Para sobrescrever só o Compose localmente, crie `docker-compose.override.yml` (está no `.gitignore`).

Para executar migrations em produção, rode um job dedicado:

```bash
pnpm db:migrate
```

## CI

A pipeline GitHub Actions (`.github/workflows/ci.yml`) roda em push e PR na branch `master` com jobs paralelos:

- **lint**: `pnpm lint` + `pnpm format:check`
- **test**: Postgres via service container, `pnpm db:migrate` + `jest`
- **audit**: `pnpm audit --prod` para vulnerabilidades em dependências
- **docker**: validação de `docker compose config` (stack segura e override de desenvolvimento) e build da imagem da aplicação

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

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://usuario:senha@localhost:5432/banco"; pnpm exec jest
```
