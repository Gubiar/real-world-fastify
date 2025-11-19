#!/bin/bash

DEV_CONTAINER="local-postgres-dev"
TEST_CONTAINER="local-postgres-test"
DB_USER="admin"
DB_PASSWORD="admin"
DEV_DB_NAME="mydb"
TEST_DB_NAME="mydb_test"
DEV_PORT="5432"
TEST_PORT="5433"

echo "🗄️  Setting up PostgreSQL databases..."
echo ""

echo "🚫 Removing existing containers if they exist..."
if [ "$(docker ps -aq -f name=$DEV_CONTAINER)" ]; then
    docker rm -f $DEV_CONTAINER
fi
if [ "$(docker ps -aq -f name=$TEST_CONTAINER)" ]; then
    docker rm -f $TEST_CONTAINER
fi

echo ""
echo "🚀 Starting DEVELOPMENT PostgreSQL container..."
docker run -d \
  --name $DEV_CONTAINER \
  -e POSTGRES_USER=$DB_USER \
  -e POSTGRES_PASSWORD=$DB_PASSWORD \
  -e POSTGRES_DB=$DEV_DB_NAME \
  -p $DEV_PORT:5432 \
  -v pgdata-dev:/var/lib/postgresql/data \
  postgres:latest

echo "✅ Development database is running!"

echo ""
echo "🧪 Starting TEST PostgreSQL container..."
docker run -d \
  --name $TEST_CONTAINER \
  -e POSTGRES_USER=$DB_USER \
  -e POSTGRES_PASSWORD=$DB_PASSWORD \
  -e POSTGRES_DB=$TEST_DB_NAME \
  -p $TEST_PORT:5432 \
  -v pgdata-test:/var/lib/postgresql/data \
  postgres:latest

echo "✅ Test database is running!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CONNECTION URLS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 DEVELOPMENT (port $DEV_PORT):"
echo "   postgresql://$DB_USER:$DB_PASSWORD@localhost:$DEV_PORT/$DEV_DB_NAME"
echo ""
echo "🧪 TEST (port $TEST_PORT):"
echo "   postgresql://$DB_USER:$DB_PASSWORD@localhost:$TEST_PORT/$TEST_DB_NAME"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Update your .env files:"
echo "   .env              → use DEV url"
echo "   .env.test         → use TEST url"
echo ""
echo "🛑 To stop:"
echo "   docker stop $DEV_CONTAINER $TEST_CONTAINER"
echo ""
echo "🗑️  To remove:"
echo "   docker rm $DEV_CONTAINER $TEST_CONTAINER"
echo ""
