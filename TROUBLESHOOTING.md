# Troubleshooting Guide

This guide helps resolve common issues when deploying the application with Docker.

## Docker Connectivity Issues

### Problem: Cannot pull Docker images

**Error message:**

```
failed to solve: DeadlineExceeded: DeadlineExceeded: DeadlineExceeded: node:20-alpine: failed to resolve source metadata
```

**Solutions:**

1. **Use the `--pull` flag with the deploy script**:

   ```bash
   ./deploy.sh --pull
   ```

   This enables retry logic for pulling images.

2. **Check your internet connection**:

   - Ensure you have a stable internet connection
   - Try connecting to Docker Hub in a browser to verify connectivity

3. **Try with a VPN or different network**:

   - Some networks might block Docker Hub
   - A VPN can help bypass network restrictions

4. **Pull images separately**:

   ```bash
   docker pull node:20.12.0-alpine3.18
   docker pull postgres:16.0-alpine
   ```

5. **Use a different base image**:
   Edit the Dockerfile to use a different Node.js image:

   ```dockerfile
   FROM node:lts-alpine
   ```

6. **Cache images offline**:
   - Pull images on a machine with good connectivity
   - Save images: `docker save node:20.12.0-alpine3.18 -o node-image.tar`
   - Load images: `docker load -i node-image.tar`

## WSL-specific Issues

### Problem: Slow performance or connectivity issues in WSL

**Solutions:**

1. **Use WSL 2 (not WSL 1)**:

   ```powershell
   wsl --set-version Ubuntu 2
   ```

2. **Adjust WSL memory limits**:
   Create a `.wslconfig` file in your Windows home directory:

   ```
   [wsl2]
   memory=4GB
   processors=2
   ```

3. **Store project files in the WSL filesystem**:

   - Don't use `/mnt/c/...` paths for Docker projects
   - Store in the WSL filesystem for better performance
   - E.g., `~/projects/real-world-fastify`

4. **Use Docker Desktop for Windows**:
   - Install Docker Desktop with WSL 2 integration
   - This often works better than Docker installed directly in WSL

## Database Issues

### Problem: Database connection failures

**Solutions:**

1. **Verify database container is running**:

   ```bash
   docker ps | grep postgres
   ```

2. **Check database logs**:

   ```bash
   docker logs fastify-postgres
   ```

3. **Ensure networks are properly configured**:

   ```bash
   docker network ls
   docker network inspect real-world-fastify_app-network
   ```

4. **Try connecting manually**:
   ```bash
   docker exec -it fastify-postgres psql -U postgres
   ```

## Build Issues

### Problem: Build fails with npm/pnpm errors

**Solutions:**

1. **Clear node_modules and try again**:

   ```bash
   docker-compose down
   docker volume prune  # Be careful with this command
   ./deploy.sh --build
   ```

2. **Check for architecture compatibility**:

   - Some packages may not work on ARM (e.g., M1 Macs)
   - Add `--platform=linux/amd64` to the build command if needed

3. **Check package-lock.json or pnpm-lock.yaml for issues**:
   - Lock files might be corrupted
   - Regenerate with `npm install` or `pnpm install`

## Getting Help

If you're still experiencing issues:

1. Open an issue on the GitHub repository
2. Include the full error output
3. Share details about your environment (OS, Docker version, etc.)
4. Try running with `COMPOSE_HTTP_TIMEOUT=300` for slower connections:
   ```bash
   COMPOSE_HTTP_TIMEOUT=300 ./deploy.sh --build
   ```
