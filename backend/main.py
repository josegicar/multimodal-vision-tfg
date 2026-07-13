from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from openai import OpenAI
import cv2
import numpy as np
import os
import base64
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelos al arrancar
yolo_model = YOLO("yolov8n.pt")
api_key = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=api_key)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Asistente Visual API funcionando"}

@app.post("/api/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    query: str = Form(...),
    language: str = Form(default="es")
):
    # 1. Leer imagen
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. Detectar objetos con YOLO
    results = yolo_model(img, conf=0.5)[0]
    detections = []
    for box in results.boxes:
        detections.append({
            "class": results.names[int(box.cls[0])],
            "confidence": round(float(box.conf[0]), 2),
            "bbox": [round(x, 1) for x in box.xyxy[0].tolist()]
        })

    # 3. Convertir imagen a base64 para enviarla a GPT-4o
    _, buffer = cv2.imencode('.jpg', img)
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    # 4. GPT-4o recibe la imagen directamente + detecciones de YOLO
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": f"Eres un asistente visual que ayuda a interpretar imágenes. Responde siempre en este idioma: {language}. Analiza la imagen proporcionada y responde la pregunta del usuario de forma clara y natural."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": f"Objetos detectados por YOLO: {detections}\n\nPregunta del usuario: {query}"
                    }
                ]
            }
        ]
    )

    return {
        "answer": response.choices[0].message.content,
        "detections": detections
    }