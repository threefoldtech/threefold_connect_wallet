FROM node:lts as builder
WORKDIR /app

COPY . .
RUN yarn install --ignore-platform --silent --frozen-lockfile

RUN yarn build


FROM nginx:alpine
RUN apk add --no-cache --repository http://nl.alpinelinux.org/alpine/edge/main libuv \
    && apk add --no-cache --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main nodejs npm \
    && apk add --no-cache --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/community yarn \
    && echo "NodeJS Version:" "$(node -v)" \
    && echo "NPM Version:" "$(npm -v)" \
    && echo "Yarn Version:" "$(yarn -v)"

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY startup.sh /startup.sh
COPY --from=builder /app /app


CMD ["/bin/sh", "startup.sh"]

# FROM nginx:stable-alpine
# RUN apk add vim bash yarn

# COPY package.json yarn.lock ./
# RUN yarn
# COPY package*.json ./
# RUN yarn install
# RUN yarn run dev
