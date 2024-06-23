# 阶段一：下载依赖
FROM golang:alpine as dependencies

WORKDIR /home/app

COPY go.mod go.sum /home/app/

RUN go version && \
    go env -w CGO_ENABLED=0 && \
    go env -w GO111MODULE=on && \
    go env -w GOPROXY=https://goproxy.cn,direct && \
    go clean --modcache && \
    go mod download

# 阶段二：构建阶段
FROM dependencies as builder

WORKDIR /home/app

COPY . /home/app

RUN go version && \
    go build main.go

# 阶段三：生产阶段
FROM scratch

WORKDIR /home/app

COPY --from=builder /home/app/main /home/app

EXPOSE 8080

CMD ["./main"]
