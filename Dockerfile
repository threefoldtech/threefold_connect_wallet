FROM node as backend_builder
WORKDIR /app

COPY ./backend/package.json /app
COPY ./backend/yarn.lock /app
RUN yarn install --frozen-lockfile --ignore-platform --silent
COPY ./backend .

FROM node as frontend_builder
WORKDIR /app

COPY ./frontend/package.json /app
COPY ./frontend/yarn.lock /app
RUN yarn install --frozen-lockfile --silent
COPY ./frontend .
RUN yarn build


FROM nginx:alpine
RUN apk add --no-cache --repository http://nl.alpinelinux.org/alpine/edge/main libuv \
    && apk add --no-cache --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/main nodejs=16.13.2-r0 npm=8.3.0-r0 \
    && apk add --no-cache --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/community yarn=1.22.17-r0 \
    && echo "NodeJS Version:" "$(node -v)" \
    && echo "NPM Version:" "$(npm -v)" \
    && echo "Yarn Version:" "$(yarn -v)"

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY startup.sh /startup.sh
COPY --from=backend_builder /app /backend
COPY --from=frontend_builder /app/dist /usr/share/nginx/html


CMD ["/bin/sh", "startup.sh"]

# FROM nginx:stable-alpine
# RUN apk add vim bash yarn

# COPY package.json yarn.lock ./
# RUN yarn
# COPY package*.json ./
# RUN yarn install
# RUN yarn run dev
