FROM golang:alpine as builder

WORKDIR /home/app

COPY . /home/app

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build main.go

FROM scratch

WORKDIR /home/app

COPY --from=builder /home/app/main .

EXPOSE 8080

CMD ["./main"]
