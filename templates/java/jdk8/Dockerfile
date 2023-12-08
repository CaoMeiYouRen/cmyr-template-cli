# 阶段一：安装依赖
FROM maven:3-eclipse-temurin-8-alpine as dependencies

RUN java -version && mvn -version

WORKDIR /home/app

COPY pom.xml /home/app/pom.xml

# 只安装依赖，跳过测试
RUN mvn dependency:go-offline -B -Dmaven.test.skip=true

# 阶段二：构建阶段
FROM dependencies as builder

COPY . /home/app

# 构建
RUN mvn clean package -Dmaven.test.skip=true

# 阶段三：生产阶段
FROM eclipse-temurin:8-jre-alpine

WORKDIR /home/app

RUN java -version

COPY --from=builder /home/app/target/main.jar /home/app

EXPOSE 8080

CMD ["java", "-jar", "main.jar"]
