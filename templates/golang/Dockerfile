# 阶段一：下载依赖
FROM golang:alpine as dependencies

WORKDIR /home/app

COPY go.mod go.sum /home/app/

ENV GOPROXY=https://mirrors.aliyun.com/goproxy/

RUN go mod download

# 阶段二：构建阶段
FROM golang:alpine as builder

WORKDIR /home/app

COPY . /home/app

ENV GOPROXY=https://mirrors.aliyun.com/goproxy/

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build main.go

# 阶段三：生产阶段
FROM scratch

WORKDIR /home/app

COPY --from=builder /home/app/main /home/app

EXPOSE 8080

CMD ["./main"]
