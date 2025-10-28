# syntax=docker/dockerfile:1.6

# 1) Builder: install deps and build
FROM node:20-alpine AS builder
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
WORKDIR /app

# Faster installs with corepack (pnpm/npm); keeping npm for compatibility
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --quiet

COPY . .

# Next.js standalone output for smaller runtime image
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_DISABLE_ESLINT=1 \
    NEXT_SKIP_TYPECHECK=1
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

# 2) Runner: minimal runtime
FROM node:20-alpine AS runner
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static/
# Projede public klasörü yoksa kopyalamaya gerek yok

# Expose Next.js port
ENV PORT=80
EXPOSE 80

USER nextjs

CMD ["node", "server.js"]

