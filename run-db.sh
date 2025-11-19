#!/bin/bash

CONTAINER_NAME="local-postgres"
DB_USER="admin"
DB_PASSWORD="admin"
DB_NAME="mydb"
DB_PORT="5432"

# Stop and remove previous container if it exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🚫 Removing existing container..."
    docker rm -f $CONTAINER_NAME
fi

# Create the container
echo "🚀 Starting PostgreSQL Docker container..."
docker run -d \
  --name $CONTAINER_NAME \
  -e POSTGRES_USER=$DB_USER \
  -e POSTGRES_PASSWORD=$DB_PASSWORD \
  -e POSTGRES_DB=$DB_NAME \
  -p $DB_PORT:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:latest

echo "✅ PostgreSQL is running!"
echo ""
echo "Connection URL:"
echo "postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME?schema=public"
