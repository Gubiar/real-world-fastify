#!/bin/bash
set -e

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD=("docker-compose")
elif docker compose version &> /dev/null; then
    COMPOSE_CMD=("docker" "compose")
else
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

COMPOSE_SECURE=("${COMPOSE_CMD[@]}" -f docker-compose.yml)
COMPOSE_WITH_DEV=("${COMPOSE_CMD[@]}" -f docker-compose.yml -f docker-compose.development.yml)

echo "Using Docker Compose command: ${COMPOSE_CMD[*]}"

show_help() {
    echo "Usage: ./deploy.sh [options]"
    echo "Options:"
    echo "  --build           Build the Docker images before starting the containers"
    echo "  --recreate        Recreate containers even if their configuration and image haven't changed"
    echo "  --down            Stop and remove containers, networks, and volumes"
    echo "  --logs            Follow the logs after starting the containers"
    echo "  --pull            Pull latest images (with retry logic)"
    echo "  --db-only         Start only the database service (PostgreSQL on 127.0.0.1:5432)"
    echo "  --dev             With app stack: also expose PostgreSQL on 127.0.0.1:5432 for host tools"
    echo "  --help            Show this help message"
}

BUILD=false
RECREATE=false
DOWN=false
LOGS=false
PULL=false
DB_ONLY=false
DEV=false

for arg in "$@"; do
    case $arg in
        --build)
            BUILD=true
            ;;
        --recreate)
            RECREATE=true
            ;;
        --down)
            DOWN=true
            ;;
        --logs)
            LOGS=true
            ;;
        --pull)
            PULL=true
            ;;
        --db-only)
            DB_ONLY=true
            ;;
        --dev)
            DEV=true
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            show_help
            exit 1
            ;;
    esac
done

if grep -qi microsoft /proc/version 2>/dev/null; then
    export COMPOSE_HTTP_TIMEOUT=300
    export DOCKER_CLIENT_TIMEOUT=300
fi

if [ "$DOWN" = true ]; then
    echo "Stopping and removing containers..."
    "${COMPOSE_WITH_DEV[@]}" down
    exit 0
fi

if [ "$PULL" = true ]; then
    echo "Pulling Docker images with retry logic..."
    max_retries=5
    retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if docker pull node:22-alpine && docker pull postgres:16-alpine; then
            echo "Successfully pulled base images."
            break
        else
            retry_count=$((retry_count+1))
            if [ $retry_count -lt $max_retries ]; then
                echo "Retry $retry_count/$max_retries: Failed to pull images. Waiting before retrying..."
                sleep 10
            else
                echo "Failed to pull images after $max_retries attempts."
                echo "You may want to try again later or check your network connection."
                echo "Continuing with local images if available..."
            fi
        fi
    done
fi

if [ "$DB_ONLY" = true ]; then
    CMD=("${COMPOSE_WITH_DEV[@]}" --profile db up -d db)
elif [ "$DEV" = true ]; then
    CMD=("${COMPOSE_WITH_DEV[@]}" --profile app up -d)
else
    CMD=("${COMPOSE_SECURE[@]}" --profile app up -d)
fi

if [ "$BUILD" = true ]; then
    CMD+=("--build")
fi

if [ "$RECREATE" = true ]; then
    CMD+=("--force-recreate")
fi

echo "Executing: ${CMD[*]}"
"${CMD[@]}"

if [ $? -eq 0 ]; then
    echo "Containers started successfully!"
else
    echo "Error starting containers. Please check the logs."
    exit 1
fi

if [ "$LOGS" = true ]; then
    echo "Following logs..."
    if [ "$DB_ONLY" = true ] || [ "$DEV" = true ]; then
        "${COMPOSE_WITH_DEV[@]}" logs -f
    else
        "${COMPOSE_SECURE[@]}" logs -f
    fi
fi

echo "Deployment completed successfully!"
echo "Your application is now running at http://localhost:3000"

_enable_docs="${ENABLE_DOCS:-}"
if [ -z "$_enable_docs" ] && [ -f .env ]; then
    _enable_docs=$(grep -m1 '^ENABLE_DOCS=' .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' || true)
fi
if [ "$_enable_docs" != "false" ]; then
    echo "Swagger documentation is available at http://localhost:3000/docs"
fi
