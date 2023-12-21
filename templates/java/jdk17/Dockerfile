# 阶段一：安装依赖
FROM maven:3-eclipse-temurin-17-alpine as dependencies

WORKDIR /home/app

RUN java -version && mvn -version && \
    echo '<?xml version="1.0" encoding="UTF-8"?><settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><mirrors><mirror><id>alimaven</id><mirrorOf>central</mirrorOf><name>aliyun maven</name><url>https://maven.aliyun.com/repository/public/</url></mirror></mirrors></settings>' > /usr/share/maven/conf/settings.xml

COPY pom.xml /home/app/pom.xml

# 只安装依赖，跳过测试
RUN mvn dependency:go-offline -B -Dmaven.test.skip=true

# 阶段二：构建阶段
FROM dependencies as builder

COPY . /home/app

# 构建
RUN mvn clean package -Dmaven.test.skip=true

# 阶段三：生产阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /home/app

RUN java -version

COPY --from=builder /home/app/target/main.jar /home/app

EXPOSE 8080

CMD ["java", "-jar", "main.jar"]
