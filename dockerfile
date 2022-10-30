# syntax=docker/dockerfile:1
FROM node as build_server
WORKDIR /app
COPY . .
WORKDIR /app/server
RUN npm i
RUN npm run build

FROM node as build_client
WORKDIR /app
COPY . .
WORKDIR /app/client
RUN npm i
RUN npm run build

FROM node
WORKDIR /app/server
COPY --from=build_server /app/server/build /app/server/build
COPY ./server/init.sql /app/server/init.sql
COPY ./server/package.json /app/server/package.json
COPY ./server/package-lock.json /app/server/package-lock.json
COPY --from=build_client /app/client/build /app/client/build
RUN npm i --omit=dev
EXPOSE 80
CMD [ "npm", "start" ]
