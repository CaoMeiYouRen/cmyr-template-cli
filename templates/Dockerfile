FROM alpine:latest
# FROM caomeiyouren/alpine-nodejs:1.1.0

# ENV NODE_ENV production

# 安装nodejs环境
RUN echo "http://mirrors.aliyun.com/alpine/edge/main/" > /etc/apk/repositories \
    && echo "http://mirrors.aliyun.com/alpine/edge/community/" >> /etc/apk/repositories \
    && apk update \
    && apk add --no-cache --update nodejs npm git \
    && node -v && npm -v && git --version \
    && npm config set registry https://registry.npmmirror.com \
    && npm i -g pnpm\
    && pnpm -v\
    && pnpm config set registry https://registry.npmmirror.com

WORKDIR /home/app

COPY package.json .npmrc /home/app/

RUN pnpm i

COPY . /home/app

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm","run", "start"]
