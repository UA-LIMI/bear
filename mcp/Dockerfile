# Use a lightweight base image
FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Install the Redis MCP Server package from Docker's MCP Catalog
# This assumes the package is published and available.
RUN npm install -g @mcp/redis-server

# Expose the default MCP server port
EXPOSE 8080

# Start the server
CMD ["mcp-redis-server"]
