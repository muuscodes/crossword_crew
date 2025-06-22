FROM node:22

# Working directory of the whole app
WORKDIR /app

# Copy npm stuff from our local folder to the docker container
COPY package*.json ./
RUN npm install 

# Copy everything from our src folder to the workingdir of the docker container
COPY . .

# Documents the ports that the Docker image is expected to listen on when it is run
EXPOSE 3000

CMD ["npm","run","dev"]