#!/bin/bash

CONTAINER_NAME="local-postgres"
DB_USER="${DB_USER:-admin}"
DB_NAME="${DB_NAME:-mydb}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-$(tr -dc A-Za-z0-9 </dev/urandom | head -c 24)}"

if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Removing existing container..."
    docker rm -f $CONTAINER_NAME
fi

echo "Starting PostgreSQL Docker container..."
docker run -d \
  --name $CONTAINER_NAME \
  -e POSTGRES_USER=$DB_USER \
  -e POSTGRES_PASSWORD=$DB_PASSWORD \
  -e POSTGRES_DB=$DB_NAME \
  -p $DB_PORT:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16.0-alpine

echo "PostgreSQL is running!"
echo ""
echo "Connection URL:"
echo "postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
