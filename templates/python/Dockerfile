FROM python:3.10-alpine

WORKDIR /home/app

# 安装python3环境和gunicorn环境
RUN python3 -V && pip3 -V\
    && ln -sf /usr/bin/pip3 /usr/bin/pip \
    && mkdir -p ~/.pip \
    && echo "[global]" > ~/.pip/pip.conf \
    && echo "index-url=https://pypi.tuna.tsinghua.edu.cn/simple/" >> ~/.pip/pip.conf \
    && echo "[install]" >> ~/.pip/pip.conf \
    && echo "trusted-host=pypi.tuna.tsinghua.edu.cn" >> ~/.pip/pip.conf \
    && pip install --upgrade pip && pip install wheel

COPY ./requirements.txt /home/app

RUN pip install -r requirements.txt

COPY . /home/app

CMD ["gunicorn", "app:app", "-p", "app.pid", "-b", "0.0.0.0:80"]
