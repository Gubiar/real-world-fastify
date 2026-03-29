#!/bin/sh
set -e

wait_for_postgres() {
  until pg_isready -d "$DATABASE_URL" > /dev/null 2>&1; do
    sleep 2
  done
}

if [ -n "$DATABASE_URL" ]; then
  wait_for_postgres
fi

exec "$@"