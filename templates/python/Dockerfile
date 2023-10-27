FROM alpine:latest

# 安装python环境
RUN echo "http://mirrors.aliyun.com/alpine/edge/main/" > /etc/apk/repositories \
    && echo "http://mirrors.aliyun.com/alpine/edge/community/" >> /etc/apk/repositories \
    && apk update \
    && apk add --no-cache --update python3 py3-pip \
    && python3 -V && pip3 -V \
    && ln -sf /usr/bin/pip3 /usr/bin/pip \
    && mkdir -p ~/.pip \
    && echo "[global]" > ~/.pip/pip.conf \
    && echo "index-url=https://pypi.tuna.tsinghua.edu.cn/simple/" >> ~/.pip/pip.conf \
    && echo "[install]" >> ~/.pip/pip.conf \
    && echo "trusted-host=pypi.tuna.tsinghua.edu.cn" >> ~/.pip/pip.conf \
    && pip install --upgrade pip && pip install wheel

WORKDIR /home/app

COPY ./requirements.txt /home/app

RUN pip install -r requirements.txt

COPY . /home/app

EXPOSE 8080

CMD ["gunicorn", "app:app", "-p", "app.pid", "-b", "0.0.0.0:8080"]
