# Use Node.js LTS version as the base image with specific version
FROM node:20.12.0-alpine3.18 AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json, pnpm-lock.yaml and other configuration files
COPY package.json pnpm-lock.yaml* tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma generate

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# Start a new stage for the production image with same specific version
FROM node:20.12.0-alpine3.18 AS production

# Set working directory
WORKDIR /app

# Install pnpm globally and add PostgreSQL client
RUN apk add --no-cache postgresql-client && \
    npm install -g pnpm

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install only production dependencies and pg for database connection checking
RUN pnpm install --prod --frozen-lockfile && \
    pnpm add pg

# Generate Prisma client in production
RUN pnpm prisma generate

# Copy built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

# Create a non-root user and switch to it
RUN addgroup -S appuser && adduser -S appuser -G appuser
# Make the app directory accessible to the user
RUN chown -R appuser:appuser /app
USER appuser

# Expose the port the app will run on
EXPOSE 3000

# Set the entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]

# Command to run the application
CMD ["node", "dist/app.js"] 