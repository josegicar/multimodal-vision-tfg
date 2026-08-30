# multimodal-vision-tfg
Proyecto de TFG centrado en la creación de un agente multimodal con FastAPI y React. Implementa un pipeline de visión artificial (YOLO, OpenCV) y procesamiento de lenguaje natural para responder consultas por voz y texto sobre objetos detectados en cámara.

## Estado actual
- ✅ Fase 0 — Asistente visual con imagen estática
- ✅ Fase 1 — Webcam en tiempo real
- 🔄 Fase 2 — Multimodal completo (en progreso)

## Stack
- **Backend**: FastAPI + YOLOv8 + GPT-4o Vision
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **Infraestructura**: Docker + Docker Compose

## Requisitos previos
- Python 3.10+
- Node.js 18+
- Cuenta de OpenAI con créditos y API key
- Docker Desktop (opcional)

## Características
- ✅ Análisis de imágenes con YOLOv8 + GPT-4o Vision
- ✅ Bounding boxes sobre objetos detectados
- ✅ Webcam en tiempo real con overlays visuales
- ✅ Memoria conversacional entre preguntas
- ✅ Análisis de colores dominantes con HSV
- ✅ Historial de consultas con miniaturas
- ✅ Soporte multiidioma (ES, EN, FR, DE, IT, PT)
- ✅ Selector de idioma persistente

## Endpoints disponibles
- `GET  /` — Estado de la API
- `POST /api/analyze` — Analiza imagen estática
- `POST /api/analyze-frame` — Analiza frame de webcam
- `POST /api/analyze-color` — Análisis de colores HSV
- `POST /api/chat` — Chat con memoria conversacional

# Primeros pasos (siempre empezar desde la raíz del proyecto)

### 1. Preparar el Entorno Virtual
Es recomendable usar un entorno virtual para mantener las dependencias aisladas.

```bash
# Crear el entorno virtual
python -m venv venv

# Activar el entorno
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

### 2. Instalar dependencias dentro del proyecto
Instala las librerias necesarias.

```bash
pip install fastapi uvicorn ultralytics openai pillow numpy python-multipart dotenv

# Si existe el archivo requirements.txt:
pip install -r requirements.txt
```
### 3. Redactar dependencias (opcional)
Genera el archivo requirements.txt para facilitar la reproducibilidad del proyecto.

```bash
pip freeze > requirements.txt
```

# Instalación

### 1. Clonar el repositorio
Clona el repositorio y edita las variables de entorno en .env

```bash
git clone https://github.com/josegicar/multimodal-vision-tfg.git
cd multimodal-vision-tfg
```

### 2. Modificaciones para cada área de trabajo

```bash
# Extrae el archivo .env.example como .env a la raíz de tu proyecto y edita las variables:
cp .env.example .env

# Aplica la plantilla de commits
git config commit.template .gitmessage

# (Opcional) Abre el editor de commits con VSCode
git config --global core.editor "code --wait"
```

# Iniciar el server de uvicorn
- Backend docs: http://127.0.0.1:8000/docs

```bash
cd backend
uvicorn main:app --reload
```

# Iniciar el frontend
- Frontend: http://localhost:5173

```bash
cd frontend
npm install # Instalar módulos la primera vez
npm run dev
```

# Arranque con Docker
```bash
docker-compose up --build
```

## Acceso
- Frontend: http://localhost:5173
- Backend docs: http://127.0.0.1:8000/docs

## Notas
- El modelo `yolov8n.pt` se descarga automáticamente en el primer arranque
- No se sube el archivo `.env` al repositorio
