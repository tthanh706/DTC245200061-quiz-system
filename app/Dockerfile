FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN mkdir -p /app/logs \
    && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "start"]