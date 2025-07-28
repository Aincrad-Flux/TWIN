FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S twin -u 1001
USER twin

# Start application
CMD ["npm", "start"]