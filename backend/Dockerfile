# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S limi -u 1001 -G nodejs

# Copy application code
COPY --chown=limi:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown limi:nodejs logs

# Switch to non-root user
USER limi

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/healthz', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["npm", "start"]
