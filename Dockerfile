FROM node:16.6

RUN mkdir -p /usr/home/main
WORKDIR /usr/home/main

COPY . /usr/home/main/
RUN npm install
RUN npm install pm2 -g

CMD [ "pm2-runtime", "ecosystem.config.js" ]