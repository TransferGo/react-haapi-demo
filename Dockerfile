FROM node:24.9 AS build

COPY package.json package-lock.json /app/

WORKDIR /app/

RUN npm install

COPY public/ /app/public/
COPY src/ /app/src/

FROM build AS dev

CMD npm run start

FROM build AS prod

RUN npm run build
