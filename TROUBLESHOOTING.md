# Troubleshooting

## Docker image pull lento ou falhando

Use:

```bash
./deploy.sh --pull --build
```

O script aplica tentativas de pull para:

- `node:22-alpine`
- `postgres:16-alpine`

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

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/fastify_db"; pnpm exec jest
```

Nesse caso, confirme que o banco está acessível e que as migrations foram aplicadas (`pnpm db:migrate`).

## Erro ao subir app com Docker

O `docker-compose.yml` constrói a `DATABASE_URL` automaticamente a partir de `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`. Coloque esses valores e `JWT_SECRET` no `.env` na raiz (veja `sample.env`).

Se aparecer erro de variável obrigatória ausente:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=fastify_db
JWT_SECRET=replace_with_32_plus_characters_secret
```

Senhas com caracteres reservados na URL (`@`, `:`, `/`, `!`, etc.) podem quebrar a montagem da URI; prefira senhas alfanuméricas para `POSTGRES_PASSWORD` ou codifique os caracteres ao montar `DATABASE_URL` manualmente.

## Migrations em produção

No `docker-compose.yml` deste repositório, `RUN_MIGRATIONS_ON_STARTUP` está fixo como `true` no serviço `app` para facilitar ambientes locais e de homologação.

Em produção, desabilite migrations no startup (override do Compose, Helm, etc.) e rode migrations em job dedicado antes do deploy:

```bash
pnpm db:migrate
```

## Variáveis de ambiente globais (Windows)

Se variáveis como `RUN_MIGRATIONS_ON_STARTUP` ou `ENABLE_DOCS` estiverem definidas no sistema (Painel de Controle / `setx`), elas podem interferir em ferramentas que interpolam `.env` com o shell. O `docker-compose.yml` fixa esses dois valores no YAML para o serviço `app` e evita esse problema com Compose.

## CI falhando

A pipeline (`.github/workflows/ci.yml`) tem jobs paralelos: `lint`, `test`, `audit` e `docker`.

**lint falha por formatação**: rode `pnpm format` localmente e faça commit.

**test falha**: o job usa um service container Postgres do GitHub Actions. Verifique se `pnpm db:migrate` e `jest` passam localmente com `pnpm test`.

**audit falha**: significa que há vulnerabilidade conhecida em dependências de produção. Rode `pnpm audit --prod` localmente para ver detalhes e atualize os pacotes afetados.

**docker falha**: verifique se `docker compose ... config` e `docker build` funcionam localmente com as mesmas variáveis mínimas (`POSTGRES_*`, `JWT_SECRET`).

**Erro "No pnpm version is specified"**: o campo `packageManager` no `package.json` deve estar presente e alinhado com a versão do pnpm usada no projeto.

## WSL lento

- Use WSL2.
- Prefira projetos no filesystem Linux.
- Use Docker Desktop com integração WSL.
