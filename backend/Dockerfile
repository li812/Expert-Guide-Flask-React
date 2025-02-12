FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    cmake \
    g++ \
    default-libmysqlclient-dev \
    build-essential \
    python3-dev \
    default-mysql-client \
    pkg-config \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

ENV FLASK_APP=app.py
ENV FLASK_ENV=development
ENV FLASK_DEBUG=1

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--reload"]