# --- Build stage ------------------------------------------------------------
FROM node:24.11.1-slim AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json* bun.lockb* ./

# Install deps
RUN npm install

# Copie du projet
COPY . .

# Build TanStack Start
RUN npm run build

# --- Run stage --------------------------------------------------------------
FROM node:24.11.1-slim AS runner

WORKDIR /app

# Copie uniquement le code buildé
COPY --from=builder /app/build ./build
COPY package.json package-lock.json* ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]
