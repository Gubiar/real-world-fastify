FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/db/migrations ./dist/src/db/migrations
RUN addgroup -g 10001 -S appuser && adduser -S -u 10001 -G appuser appuser
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 3000
CMD ["node", "dist/src/server.js"]
