# Build the frontend.
FROM node:24-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Install the backend's production dependencies only.
FROM node:24-slim AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=backend-deps /app/backend/node_modules backend/node_modules
COPY backend/package.json backend/
COPY backend/migrations backend/migrations
COPY backend/src backend/src
COPY --from=frontend /app/frontend/dist frontend/dist

USER node
WORKDIR /app/backend
EXPOSE 3000
# Bring the database schema up to date, then start the server. exec makes node the main process,
# so it receives docker stop's SIGTERM and shuts down cleanly.
CMD ["sh", "-c", "node src/migrate.js && exec node src/server.js"]
