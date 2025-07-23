FROM node:22 AS base

WORKDIR /usr/src/app

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install --prefix ./backend
RUN npm install --prefix ./frontend

COPY ./backend ./backend
COPY ./frontend ./frontend

RUN npm run build --prefix ./frontend

FROM node:22 AS production

WORKDIR /usr/src/app

COPY --from=base /usr/src/app/backend ./backend
COPY --from=base /usr/src/app/frontend ./frontend

EXPOSE 3000

CMD ["npm", "start", "--prefix", "./backend"]
