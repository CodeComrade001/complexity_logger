# Stage 1: Build the Vite frontend
FROM node:20-alpine AS builder
WORKDIR /app/client

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Install TypeScript if needed
RUN pnpm install --save-dev typescript

RUN pnpm run build

# Remove dev dependencies afterwards
RUN pnpm prune --production


# Stage 2: Serve the static files with Nginx
FROM nginx:alpine
WORKDIR /app/client

# Copy built site into nginx html folder
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy site nginx config (make sure this file exists in build context)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Optional: a basic healthcheck (docker will use HTTP GET to /)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
