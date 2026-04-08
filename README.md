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
- Docker (para testes, banco local e imagem de produção)
- PostgreSQL 16+ (via Docker incluído neste repositório ou externo)

Dúvidas e erros comuns: [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Início rápido

O arquivo `sample.env` já contém valores coerentes entre si (`DATABASE_URL` alinhada com `POSTGRES_*` para uso em `localhost:5432`). Para começar:

1. `pnpm install`
2. `Copy-Item sample.env .env` (PowerShell) ou `cp sample.env .env` (Bash)
3. Subir só o Postgres em `127.0.0.1:5432`: `pnpm docker:db` (aguarde alguns segundos)
4. `pnpm db:migrate` e `pnpm dev`

API em `http://localhost:3000`, documentação em `http://localhost:3000/docs`. Testes: `pnpm test` (sobe o Postgres via Docker automaticamente).

**Stack completa no Docker (API + Postgres, banco não exposto ao host):** com o mesmo `.env`, use `pnpm docker:up`. **API + Postgres com ferramentas no host (Studio, `psql`):** `pnpm docker:up:dev`.

### O que configurar antes de um deploy sério

| O que | Motivo |
|--------|--------|
| `JWT_SECRET` | Trocar o valor de exemplo por um segredo longo e aleatório (mínimo 32 caracteres). Nunca commitar o valor real. |
| `POSTGRES_PASSWORD` e usuário / base | Credenciais fortes em produção; alinhar com o que o Postgres da infraestrutura espera. |
| `CORS_ORIGIN` | Domínios reais do front-end (sem `*` em produção). |
| `TRUST_PROXY` | `true` se a API estiver atrás de Nginx, Cloudflare ou load balancer (rate limit e IP corretos). |
| Migrations em produção | Preferir job de CI/CD ou `pnpm db:migrate` antes do deploy; desativar migrations na subida do container no seu override, se adotar essa política. |

O passo a passo de Docker e rede está na seção [Docker](#docker). Em resumo: a configuração é **segura por padrão** — o Postgres fica só na rede interna do Compose (`pnpm docker:up`); para desenvolvimento com o banco acessível na máquina, use `pnpm docker:up:dev` ou `pnpm docker:db`.

## Setup local (detalhe)

1. Instale dependências:

```bash
pnpm install
```

2. Copie as variáveis:

```bash
cp sample.env .env
```

PowerShell: `Copy-Item sample.env .env`

3. Garanta um Postgres acessível pela `DATABASE_URL` (por exemplo `pnpm docker:db` com o `sample.env` sem alterações).

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
- No `docker-compose.yml`, `RUN_MIGRATIONS_ON_STARTUP` e `ENABLE_DOCS` têm valores fixos (`true` e `false`) para não serem sobrescritos por variáveis globais do sistema. Em deploy real, desative migrations na subida e rode-as em job dedicado; use `docker-compose.override.yml` (ignorado pelo Git) se precisar ajustar o Compose localmente.
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
| `CORS_ORIGIN` | Não | `*` (dev) | Origens permitidas (lista separada por vírgula) |
| `ENABLE_DOCS` | Não | `true` (dev) / `false` (prod) | Habilita Swagger UI em `/docs` (no `docker-compose.yml` deste repositório o valor é `false`, fixo; no `docker-compose.development.yml` é `true`) |
| `RUN_MIGRATIONS_ON_STARTUP` | Não | `true` (dev) / `false` (prod) | Roda migrations ao iniciar (no `docker-compose.yml` deste repositório o valor é `true`, fixo) |
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
- `pnpm docker:up` / `pnpm docker:up:dev` / `pnpm docker:down` / `pnpm docker:db`: stack segura (Compose base), stack com Postgres em `localhost`, encerrar stack, só o banco com porta local

## Docker

O `docker compose` lê o arquivo `.env` na raiz do projeto para interpolar variáveis. Defina `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` e `JWT_SECRET` (mínimo 32 caracteres) no `.env` (pode copiar do `sample.env`). O serviço `app` recebe `DATABASE_URL` montada a partir desses dados com hostname interno `db`; não é necessário repetir `DATABASE_URL` no `.env` para a stack Docker.

Por padrão, o PostgreSQL **não** publica porta no host: apenas o container da API na rede `app-network` alcança o banco. O `docker-compose.yml` fixa `ENABLE_DOCS=false` e `RUN_MIGRATIONS_ON_STARTUP=true` no serviço `app`. O arquivo `docker-compose.development.yml` expõe `127.0.0.1:5432` no Postgres e define `ENABLE_DOCS=true` no `app` para um fluxo de desenvolvimento mais próximo do dia a dia.

As migrations rodam na subida do container neste Compose, por padrão. Em produção, desative migrations na subida (override ou orquestrador) e rode-as em job dedicado antes do deploy.

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

Equivalente com pnpm: `pnpm docker:up` (seguro por padrão) e `pnpm docker:up:dev` (Postgres em `localhost` + Swagger habilitado no container).

Parar tudo:

```bash
./deploy.sh --down
```

O script `deploy.sh` é Bash (Git Bash ou WSL no Windows). No PowerShell use os comandos `pnpm docker:*` acima.

Credenciais e `JWT_SECRET` ficam no `.env`. Senhas com caracteres especiais na URL do Postgres devem ser codificadas (percent-encoding) se você montar `DATABASE_URL` manualmente; no Compose, prefira senhas alfanuméricas nos campos `POSTGRES_*` ou consulte a documentação do PostgreSQL sobre URIs de conexão.

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
- **docker**: validação de `docker compose config` (stack segura por padrão e override de desenvolvimento) e build da imagem da aplicação

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

Os testes usam `buildApp()` e `app.inject()` sem subir servidor HTTP externo. O arquivo `test/setup.ts` define variáveis de ambiente para o ambiente de teste.

Para rodar jest manualmente contra um banco já existente:

```bash
DATABASE_URL=postgresql://... pnpm exec jest
```

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://usuario:senha@localhost:5432/banco"; pnpm exec jest
```
