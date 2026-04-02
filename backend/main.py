from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from openai import OpenAI
import cv2
import numpy as np
import os
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
    query: str = Form(...)
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

    # 3. Llamar al LLM con el contexto de las detecciones
    objects_list = ", ".join([d["class"] for d in detections]) or "ninguno"
    prompt = f"""
    Objetos detectados en la imagen: {objects_list}
    Detalles completos: {detections}

    Pregunta del usuario: {query}

    Responde de forma clara y natural basándote en los objetos detectados.
    Si preguntan por localización, usa las coordenadas bbox como referencia.
    """

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Eres un asistente visual que ayuda a interpretar imágenes."},
            {"role": "user", "content": prompt}
        ]
    )

    return {
        "answer": response.choices[0].message.content,
        "detections": detections
    }