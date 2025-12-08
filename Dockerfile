# Stage 1 : builder
FROM node:24.11.1-slim AS builder

WORKDIR /app

# Copie uniquement package.json et package-lock.json pour le cache
COPY package.json package-lock.json* ./

# Installe les dépendances
RUN npm install --legacy-peer-deps

# Copie tout le projet
COPY . .

# Build Vite
RUN npm run build

# Stage 2 : prod
FROM node:24.11.1-slim

WORKDIR /app

# Copie le build depuis le stage builder
COPY --from=builder /app .

# Expose le port de ton app
EXPOSE 4173

# Démarre ton app
CMD ["npm", "run", "start"]
