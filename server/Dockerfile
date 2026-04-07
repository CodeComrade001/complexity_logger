# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app/server

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only dependency files first for caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code (after .dockerignore has excluded heavy files)
COPY . .
RUN pnpm run build

# Create minimal production bundle
RUN pnpm deploy --prod /app/pruned

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app/server

# Copy only necessary artifacts from builder
COPY --from=builder /app/pruned/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/app/index.js"]