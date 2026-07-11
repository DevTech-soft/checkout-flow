# syntax=docker/dockerfile:1

# ---- deps ---------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma.config.ts requires DATABASE_URL to be resolvable at generate-time;
# this placeholder is never used to connect, only to satisfy that check.
ARG DATABASE_URL=postgresql://user:password@localhost:5432/db
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

# ---- production -----------------------------------------------------------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nestjs && adduser -S nestjs -G nestjs

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
# prisma.config.ts is TS-only and not compiled for runtime use; the CLI needs
# a plain CJS config at the project root to resolve the datasource at deploy time.
COPY prisma.config.production.js ./prisma.config.js

USER nestjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
