# syntax=docker/dockerfile:1
FROM node:20-slim AS base

WORKDIR /usr/src/app

# Install only production dependencies
COPY package.json ./
RUN npm install --production

# Copy the server code
COPY server.js ./

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server.js"]
