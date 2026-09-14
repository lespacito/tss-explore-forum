FROM oven/bun:1-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_APP_NAME="Parlons Violence"
ARG VITE_APP_URL
ARG VITE_BETTER_AUTH_URL

ENV NODE_ENV=production
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_BETTER_AUTH_URL=$VITE_BETTER_AUTH_URL

RUN bun --bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

# Installer uniquement les production dependencies
RUN bun install --production --frozen-lockfile

USER bun
EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
