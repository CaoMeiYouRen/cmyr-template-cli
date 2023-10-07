FROM alpine:latest

# 安装java环境
RUN echo "http://mirrors.aliyun.com/alpine/edge/main/" > /etc/apk/repositories \
    && echo "http://mirrors.aliyun.com/alpine/edge/community/" >> /etc/apk/repositories \
    && apk update \
    && apk add --no-cache --update openjdk8 \
    && java -version

WORKDIR /home/app

COPY ./target/main.jar /home/app

EXPOSE 8080

CMD ["java", "-jar", "main.jar"]
