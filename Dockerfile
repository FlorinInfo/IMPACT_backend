ARG PORT=3000

FROM node:lts-alpine AS node

# Builder stage

FROM node as BUILDER
WORKDIR /app
COPY package*.json ./
RUN npm i --production
COPY . .

EXPOSE ${PORT}
