# 阶段一：构建阶段
FROM golang:alpine as builder

WORKDIR /home/app

COPY . /home/app

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build main.go

# 阶段二：生产阶段
FROM scratch

WORKDIR /home/app

COPY --from=builder /home/app/main /home/app

EXPOSE 8080

CMD ["./main"]
