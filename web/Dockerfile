FROM node:22-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Prisma schema + config are needed by the postinstall `prisma generate`.
COPY package.json package-lock.json* prisma.config.ts ./
COPY prisma ./prisma
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
