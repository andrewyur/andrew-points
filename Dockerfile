# Stage 1: Build
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# provide local database so db client can be created during build time
ENV DATABASE_URL=file:local.db
RUN npm run build

# Stage 2: Run
FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY package*.json ./
RUN npm ci --omit=dev

ENV PORT=3000
EXPOSE 3000

CMD ["node", "build"]
