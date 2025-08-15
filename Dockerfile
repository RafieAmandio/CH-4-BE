# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma:generate

# Build the application (copy-assets script now handles missing data files gracefully)
RUN pnpm build

# Debug: List locations of Prisma-related files
RUN echo "Searching for Prisma files..." && \
    find /app -name "*.prisma" -o -path "*prisma*" | sort

# Debug: Print the entire directory structure to see where the schools.json might be
RUN echo "Printing directory structure:" && \
    find /app -type f -name "*.json" | sort && \
    echo "Complete directory listing:" && \
    find /app -type f | grep -v "node_modules" | sort

# Production stage
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install production dependencies and Prisma CLI
RUN pnpm install --prod --frozen-lockfile && \
    pnpm add -D prisma

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Use shell to handle errors for copying Prisma files
RUN mkdir -p ./node_modules/.pnpm/
RUN mkdir -p ./node_modules/@prisma/
RUN mkdir -p ./node_modules/.prisma/

# Generate Prisma client in the production stage (guarantees it exists)
RUN pnpm prisma:generate

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"]