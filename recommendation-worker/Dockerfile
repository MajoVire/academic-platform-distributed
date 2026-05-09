FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY recommendation-worker/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY recommendation-worker/worker.py ./worker.py
COPY recommendation-service/app ./app

CMD ["python", "worker.py"]
