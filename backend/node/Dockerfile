FROM node:14-alpine

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

COPY ./*.js ./
RUN mkdir ./routes
COPY ./routes/*.js ./routes/
RUN mkdir ./db
COPY ./db/*.js ./db/
