# -----------------------
# Stage 1: Build Stage
# -----------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build the project
RUN npm run build

# -----------------------
# Stage 2: Production Stage
# -----------------------
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

# Expose app port
EXPOSE 5000

# Set environment variables (optional)
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/server.js"]
