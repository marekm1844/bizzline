# Stage 1: Build the application
FROM node:19-alpine AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Stage 2: Run the application
FROM node:19-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json yarn.lock ./
RUN yarn install --production
EXPOSE 3000
CMD ["node", "dist/main"]
