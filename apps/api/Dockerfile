# ── Stage 1: Install all deps (dev + prod) for build ──────────────────────────
FROM node:20-alpine AS all-deps
WORKDIR /app

# Copy manifests only — changes here bust cache; source changes do not
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json        ./apps/api/
COPY apps/web/package.json        ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci

# ── Stage 2: Install production deps only ──────────────────────────────────────
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json        ./apps/api/
COPY apps/web/package.json        ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci --omit=dev

# ── Stage 3: Compile TypeScript ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=all-deps /app/node_modules ./node_modules

COPY tsconfig.base.json ./
COPY packages/shared-types/ ./packages/shared-types/
COPY apps/api/ ./apps/api/

RUN npm run build --workspace=@sentinelscan/api

# ── Stage 4: Minimal production image ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Run as a non-root user — principle of least privilege
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 sentinelscan

COPY --from=prod-deps --chown=sentinelscan:nodejs /app/node_modules     ./node_modules
COPY --from=builder   --chown=sentinelscan:nodejs /app/apps/api/dist    ./dist
COPY --from=builder   --chown=sentinelscan:nodejs /app/apps/api/package.json ./

USER sentinelscan

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
