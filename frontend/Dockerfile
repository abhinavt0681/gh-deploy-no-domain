FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies using npm install since we don't have a package-lock.json file
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1

# Create public directory if it doesn't exist
RUN mkdir -p public

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built application
COPY --from=builder /app/public ./public || true
COPY --from=builder /app/.next/static ./.next/static || mkdir -p ./.next/static
COPY --from=builder /app/.next/standalone ./ || echo "No standalone output found - check Next.js build configuration"

EXPOSE 3000

ENV PORT 3000

# Start the Next.js application
CMD ["node", "server.js"] 