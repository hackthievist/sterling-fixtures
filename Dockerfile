FROM node:8.10.0-alpine
LABEL MAINTAINER="Ifeoluwa Sobogun <sobogunifeoluwa@gmail.com>"

WORKDIR /www

ADD package.json yarn.lock /www/
RUN yarn install \
	&& yarn cache clean;

ADD . /www

CMD ["yarn", "start"]
