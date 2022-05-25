FROM node:fermium-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY ./ ./

RUN yarn build

CMD ["node", "build/src/server.js"]