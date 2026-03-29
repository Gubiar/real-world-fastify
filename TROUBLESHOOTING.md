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

## Erro de conexão com banco nos testes

Confirme no `.env`:

- `DATABASE_URL` válido
- banco acessível

Execute migrations antes dos testes:

```bash
pnpm db:migrate
pnpm test
```

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

O container da aplicação não executa migration automática em startup.

Execute migrations antes do deploy:

```bash
pnpm db:migrate
```

## WSL lento

- Use WSL2.
- Prefira projetos no filesystem Linux.
- Use Docker Desktop com integração WSL.
