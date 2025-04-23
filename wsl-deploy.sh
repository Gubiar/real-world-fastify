#!/bin/bash
set -e

# Check if running in WSL
if ! grep -q Microsoft /proc/version && ! grep -q microsoft /proc/version; then
    echo "This script is intended for WSL environments. Use deploy.sh for non-WSL deployments."
    exit 1
fi

echo "🐧 Running WSL-optimized deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check which Docker Compose command to use (v1 or v2)
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "🐳 Using Docker Compose command: $COMPOSE_CMD"

# Function to show help
show_help() {
    echo "Usage: ./wsl-deploy.sh [options]"
    echo "Options:"
    echo "  --build           Build the Docker images before starting the containers"
    echo "  --recreate        Recreate containers even if their configuration and image haven't changed"
    echo "  --down            Stop and remove containers, networks, and volumes"
    echo "  --logs            Follow the logs after starting the containers"
    echo "  --pull            Pull latest images (with retry logic and increased timeout)"
    echo "  --help            Show this help message"
}

# Parse arguments
BUILD=false
RECREATE=false
DOWN=false
LOGS=false
PULL=false

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

# WSL optimization - increase Docker timeout
export COMPOSE_HTTP_TIMEOUT=300
export DOCKER_CLIENT_TIMEOUT=300

# If --down is specified, stop and remove containers
if [ "$DOWN" = true ]; then
    echo "🛑 Stopping and removing containers..."
    $COMPOSE_CMD down
    exit 0
fi

# Pull images with retry logic
if [ "$PULL" = true ]; then
    echo "📥 Pulling Docker images with retry logic (extended timeout for WSL)..."
    max_retries=5
    retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if timeout 300 docker pull node:20.12.0-alpine3.18; then
            echo "✅ Successfully pulled Node.js image."
            if timeout 300 docker pull postgres:16.0-alpine; then
                echo "✅ Successfully pulled PostgreSQL image."
                break
            fi
        fi
        
        retry_count=$((retry_count+1))
        if [ $retry_count -lt $max_retries ]; then
            echo "🔄 Retry $retry_count/$max_retries: Failed to pull images. Waiting before retrying..."
            sleep 15
        else
            echo "⚠️ Failed to pull images after $max_retries attempts."
            echo "⚠️ You may want to try again later or check your network connection."
            echo "⚠️ Continuing with local images if available..."
        fi
    done
fi

# Build command
CMD="$COMPOSE_CMD up -d"

# Add options based on arguments
if [ "$BUILD" = true ]; then
    CMD="$CMD --build"
fi

if [ "$RECREATE" = true ]; then
    CMD="$CMD --force-recreate"
fi

# Execute the command
echo "🚀 Executing: $CMD"
eval $CMD

# Check if containers started successfully
if [ $? -eq 0 ]; then
    echo "✅ Containers started successfully!"
else
    echo "❌ Error starting containers. Please check the logs."
    exit 1
fi

# If --logs is specified, follow the logs
if [ "$LOGS" = true ]; then
    echo "📋 Following logs..."
    $COMPOSE_CMD logs -f
fi

echo "🎉 Deployment completed successfully!"
echo "🌐 Your application is now running at http://localhost:3000"
echo "📚 Swagger documentation is available at http://localhost:3000/docs"
echo ""
echo "💡 WSL Performance Tips:"
echo "   1. Store project files in the WSL filesystem (not /mnt/c) for better performance"
echo "   2. Use WSL 2 rather than WSL 1"
echo "   3. Consider using Docker Desktop for Windows with WSL 2 integration"
echo "   4. See TROUBLESHOOTING.md for more performance tips" 