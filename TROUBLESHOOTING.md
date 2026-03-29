# Troubleshooting

## Docker image pull lento ou falhando

Use:

```bash
./deploy.sh --pull --build
```

O script aplica tentativas de pull para:

- `node:22-alpine`
- `postgres:16.0-alpine`

## Banco não sobe antes da aplicação

O `docker-compose.yml` já possui healthcheck no Postgres e `depends_on` com `service_healthy`.

Valide o status:

```bash
docker compose ps
docker compose logs db
```

## Só quero ambiente de desenvolvimento com banco

Use:

```bash
./deploy.sh --db-only
```

As variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` são obrigatórias mesmo para o perfil `db`.

## Erro de conexão com banco nos testes

`pnpm test` é auto-suficiente: o script `scripts/run-tests.ts` sobe um container Postgres efêmero, aplica migrations e remove o container ao final. Basta ter Docker rodando.

Se quiser rodar jest diretamente contra um banco externo:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fastify_db pnpm exec jest
```

Nesse caso, confirme que o banco está acessível e que as migrations foram aplicadas (`pnpm db:migrate`).

## Erro ao subir app com Docker

Se aparecer erro de variável obrigatória ausente em `docker compose`, exporte:

```bash
export POSTGRES_USER=app_user
export POSTGRES_PASSWORD=strong_db_password
export POSTGRES_DB=app_db
export DATABASE_URL=postgresql://app_user:strong_db_password@db:5432/app_db
export JWT_SECRET=replace_with_32_plus_characters_secret
export CORS_ORIGIN=https://api.example.com
```

## Migrations em produção

Por padrão, o container da aplicação não executa migrations no startup (`RUN_MIGRATIONS_ON_STARTUP=false`).

É possível habilitar via `RUN_MIGRATIONS_ON_STARTUP=true`, mas o recomendado é rodar migrations em job dedicado antes do deploy:

```bash
pnpm db:migrate
```

## CI falhando

A pipeline (`.github/workflows/ci.yml`) tem 3 jobs: `lint`, `test` e `audit`.

**lint falha por formatação**: rode `pnpm format` localmente e faça commit.

**test falha**: o job usa um service container Postgres do GitHub Actions. Verifique se `pnpm db:migrate` e `jest` passam localmente com `pnpm test`.

**audit falha**: significa que há vulnerabilidade conhecida em dependências de produção. Rode `pnpm audit --prod` localmente para ver detalhes e atualize os pacotes afetados.

**Erro "No pnpm version is specified"**: o campo `packageManager` no `package.json` deve estar presente e alinhado com a versão do pnpm usada no projeto.

## WSL lento

- Use WSL2.
- Prefira projetos no filesystem Linux.
- Use Docker Desktop com integração WSL.
