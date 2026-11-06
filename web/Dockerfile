FROM node:22-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN chown -R node:node /app
USER node

COPY --chown=node:node package*.json prisma.config.ts ./
COPY --chown=node:node prisma ./prisma

RUN npm config set registry https://registry.npmmirror.com \
 && npm install --no-audit --no-fund
RUN mkdir -p /app/.next /app/node_modules && chown -R node:node /app/.next /app/node_modules
COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "run", "dev"]