#!/bin/sh
set -e

wait_for_postgres() {
  echo "Waiting for PostgreSQL to be ready..."
  until pg_isready -d "$DATABASE_URL" > /dev/null 2>&1; do
    echo "PostgreSQL is unavailable - sleeping 2s"
    sleep 2
  done
  echo "PostgreSQL is up and running!"
}

if [ -n "$DATABASE_URL" ]; then
  wait_for_postgres
  echo "Running database migrations..."
  npx drizzle-kit migrate
  echo "Migrations completed successfully!"
fi

exec "$@" 