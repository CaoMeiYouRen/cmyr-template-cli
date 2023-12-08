# 阶段一：构建阶段
FROM alpine:latest as builder

ENV OPENJDK='openjdk8'
# 安装 jdk 环境
RUN echo "http://mirrors.aliyun.com/alpine/edge/main/" > /etc/apk/repositories \
    && echo "http://mirrors.aliyun.com/alpine/edge/community/" >> /etc/apk/repositories \
    && apk update \
    && apk add --no-cache --update ${OPENJDK} maven \
    && java -version && mvn -version
# 构建
RUN mvn clean package -Dmaven.test.skip=true

FROM alpine:latest

ENV OPENJDK_JRE='openjdk8-jre'
# 安装 jre 环境
RUN echo "http://mirrors.aliyun.com/alpine/edge/main/" > /etc/apk/repositories \
    && echo "http://mirrors.aliyun.com/alpine/edge/community/" >> /etc/apk/repositories \
    && apk update \
    && apk add --no-cache --update ${OPENJDK_JRE} \
    && java -version

WORKDIR /home/app

COPY --from=builder /home/app/target/main.jar /home/app

EXPOSE 8080

CMD ["java", "-jar", "main.jar"]
