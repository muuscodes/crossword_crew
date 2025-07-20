# Dockerfile
FROM node:22 AS base

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for both backend and frontend
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both backend and frontend
RUN npm install --prefix ./backend
RUN npm install --prefix ./frontend

# Copy the rest of the application code
COPY ./backend ./backend
COPY ./frontend ./frontend

# Build the frontend application
RUN npm run build --prefix ./frontend

# Stage for production
FROM node:22 AS production

# Set the working directory
WORKDIR /usr/src/app

# Copy backend and built frontend files
COPY --from=base /usr/src/app/backend ./backend
COPY --from=base /usr/src/app/frontend ./frontend

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
