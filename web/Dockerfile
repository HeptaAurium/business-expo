FROM node:22-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN chown -R node:node /app
USER node

COPY --chown=node:node . .
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]