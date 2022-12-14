FROM node:12-bullseye-slim

WORKDIR /app

COPY package*.json ./

ENV PATH=$PATH:/app/node_modules/.bin

run npm install

COPY . .

EXPOSE 8080

CMD ["quasar", "dev"]
