# Contracts Dockerfile - For running Hardhat and contract deployment
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy contracts and scripts
COPY . .

# Expose Hardhat node port
EXPOSE 8545

# Environment variables
ENV NODE_ENV=development
ENV HARDHAT_NETWORK=localhost

# Default command runs Hardhat node
# Override with docker run -it <image> npx hardhat run scripts/deploy.js --network localhost
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
