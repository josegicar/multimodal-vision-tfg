FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
<<<<<<< HEAD

RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

=======
>>>>>>> a1f0832aab51cd71d34c61ccb545ba39019251c4
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]