# Stage 1 : builder
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
# If you have a lockfile, uncomment the next line
# COPY bun.lockb ./

# Install dependencies
RUN bun install

# Copy source
COPY . .

# Build app
RUN bun vite build

# Stage 2 : prod
FROM oven/bun:1-slim

WORKDIR /app

# Copy build artifacts
COPY --from=builder /app .

# Environment configuration
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start app
CMD ["bun", "server.ts"]
