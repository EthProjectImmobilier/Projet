FROM python:3.11-slim

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY requirements.txt .

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy app sources
COPY . .

# Expose port if the app serves HTTP (adjust if not needed)
EXPOSE 8000

# Default command (adjust to your actual entrypoint)
CMD ["python", "main.py"]