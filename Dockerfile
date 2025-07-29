FROM node:20-alpine

WORKDIR /app

# Non-root user for security (create early)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S twin -u 1001

# Copy package.json and install dependencies (including devDependencies for development)
COPY package*.json ./
RUN npm ci

# Copy source code and documentation
COPY src/ ./src/
COPY doc/ ./doc/

# Create logs directory
RUN mkdir -p logs

# Change ownership of the app directory to twin user
RUN chown -R twin:nodejs /app

# Switch to non-root user
USER twin

# Expose port
EXPOSE 3000

# Start application in development mode
CMD ["npm", "run", "dev"]