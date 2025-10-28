# syntax=docker/dockerfile:1.6

# 1) Builder: install deps and build
FROM node:20-alpine AS builder
WORKDIR /app

# Faster installs with corepack (pnpm/npm); keeping npm for compatibility
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --quiet

COPY . .

# Next.js standalone output for smaller runtime image
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 2) Runner: minimal runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 2>/dev/null || true

# Expose Next.js port
ENV PORT=3001
EXPOSE 3001

USER nextjs

CMD ["node", "server.js"]

