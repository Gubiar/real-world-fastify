#!/bin/sh
set -e

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
  echo "Waiting for PostgreSQL to be ready..."
  
  until node -e "
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    client.connect()
      .then(() => {
        console.log('PostgreSQL is ready');
        client.end();
        process.exit(0);
      })
      .catch(err => {
        console.error('Error connecting to PostgreSQL:', err);
        process.exit(1);
      });
  " > /dev/null 2>&1; do
    echo "PostgreSQL is unavailable - sleeping 2s"
    sleep 2
  done
  
  echo "PostgreSQL is up and running!"
}

# If $DATABASE_URL is set, wait for PostgreSQL and run migrations
if [ -n "$DATABASE_URL" ]; then
  wait_for_postgres
  
  echo "Running database migrations..."
  npx prisma migrate deploy
  
  echo "Migrations completed successfully!"
fi

# Start the application
exec "$@" 