# ---------- Build ----------
FROM node:24.11.1 AS builder

WORKDIR /app

COPY package.json bun.lockb ./
COPY . .

RUN corepack enable && corepack prepare bun@1.1.38 --activate

RUN bun install
RUN bun run build

# ---------- Run ----------
FROM node:24.11.1 AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN corepack enable && corepack prepare bun@1.1.38 --activate

EXPOSE 3000
CMD ["bun", "run", "serve"]
