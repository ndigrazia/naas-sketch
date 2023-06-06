FROM node:16

WORKDIR /app
COPY package*.json app.js ./
RUN npm install

EXPOSE 9030

CMD [ "npm", "start" ]
