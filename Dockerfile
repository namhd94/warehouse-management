# ── Stage 1: Build the React frontend ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies needed to build)
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy source and build the React app
COPY . .
RUN npm run build

# ── Stage 2: Production server ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy server and built frontend from builder
COPY server.js ./
COPY --from=builder /app/dist ./dist

# Fly.io will mount a persistent volume at /data
# DATA_DIR tells server.js where to store warehouse.db
ENV DATA_DIR=/data
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port Fly.io will route traffic to
EXPOSE 3000

# Ensure the data volume directory exists, then start the server
CMD ["/bin/sh", "-c", "mkdir -p /data && node server.js"]
