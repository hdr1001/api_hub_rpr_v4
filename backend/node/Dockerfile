FROM node:16-alpine

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}

RUN apk --update --no-cache add postgresql-client

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN if [ "$NODE_ENV" = "production" ] ; then \
   npm install --production --silent ; \
   else \
   npm install --production=false --silent ; \
fi 

COPY ./.env ./
COPY ./*.js ./
RUN mkdir ./routes
COPY ./routes/*.js ./routes/
