FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY main.mjs ./

EXPOSE 9100

CMD ["node", "main.mjs"]
