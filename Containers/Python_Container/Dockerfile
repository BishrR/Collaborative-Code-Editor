FROM python:latest

WORKDIR /usr/app/src

# COPY requirements.txt ./
COPY app.py ./


# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --upgrade Flask

RUN pip install werkzeug===2.2.2

EXPOSE 5000

CMD ["python3", "app.py"]
