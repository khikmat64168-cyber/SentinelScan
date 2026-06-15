# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json        ./apps/web/
COPY apps/api/package.json        ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci

# ── Stage 2: Build Vite bundle ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY tsconfig.base.json ./
COPY packages/shared-types/ ./packages/shared-types/
COPY apps/web/ ./apps/web/

RUN npm run build --workspace=@sentinelscan/web

# ── Stage 3: Serve static assets via Nginx ───────────────────────────────────
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/apps/web/dist         /usr/share/nginx/html
COPY docker/nginx/nginx.conf                   /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost/health || exit 1
