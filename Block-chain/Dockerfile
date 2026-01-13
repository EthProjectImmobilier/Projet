# build/runtime image for Hardhat-based blockchain project (used for CI and tools)
FROM node:18-alpine

WORKDIR /app

# Install system deps required by some hardhat plugins (alpine)
RUN apk add --no-cache git python3 make g++

# Copy package manifest and install deps
COPY package*.json ./
RUN npm ci --silent

# Copy sources
COPY . .

# Compile contracts (if configured) and run any build step
RUN npx hardhat compile || true
RUN npm run build --if-present || true

# Default entry: keep container alive so it can be used for ad-hoc commands in CI
CMD ["sh", "-c", "while true; do sleep 3600; done"]