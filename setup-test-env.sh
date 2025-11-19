#!/bin/bash

echo "🧪 Setting up test environment..."
echo ""

if [ ! -f .env.test ]; then
    echo "📄 Creating .env.test from sample..."
    cp sample.env.test .env.test
    echo "✅ .env.test created!"
else
    echo "ℹ️  .env.test already exists"
fi

echo ""
echo "🚀 Starting test database..."
./run-db.sh

echo ""
echo "⏳ Waiting for databases to be ready..."
sleep 3

echo ""
echo "🔄 Running migrations on test database..."
DATABASE_URL="postgresql://admin:admin@localhost:5433/mydb_test" pnpm db:push

echo ""
echo "✅ Test environment is ready!"
echo ""
echo "🧪 Run tests with:"
echo "   pnpm test"

