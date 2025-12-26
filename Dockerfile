# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Install only production dependencies (if we separated them, but here we just need the same env usually or just server deps)
# Since we are using a simple express server in the same repo, we can copy everything or just what we need.
# For simplicity in this mono-repo setup:
RUN npm install --production

# Copy server code
COPY server ./server

# Copy built frontend assets
COPY --from=build /app/dist ./dist

# Create data directory for volume mounting
RUN mkdir -p server/data

EXPOSE 3001

CMD ["node", "server/index.js"]
