FROM node:8.10.0-alpine
LABEL MAINTAINER="Ifeoluwa Sobogun <sobogunifeoluwa@gmail.com>"

WORKDIR /www

ADD application/package.json application/yarn.lock /www/
RUN yarn install \
	&& yarn cache clean;

ADD application /www

CMD ["yarn", "start"]
