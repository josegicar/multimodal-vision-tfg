# multimodal-vision-tfg
Proyecto de TFG centrado en la creación de un agente multimodal (Mini) con FastAPI y React. Implementa un pipeline de visión artificial, procesamiento de lenguaje natural y orquestación de herramientas (SmolAgents) para interactuar mediante voz o texto con contenido visual en tiempo real.

## Estado actual
- ✅ Fase 0 — Asistente visual con imagen estática
- ✅ Fase 1 — Webcam en tiempo real
- ✅ Fase 2 — Características multimodales completadas (Agente autónomo, STT, TTS, Modo Conversación)

## Stack
- **Backend**: FastAPI + YOLOv8 + GPT-4o Vision + SmolAgents + Faster-Whisper (STT) + Edge-TTS
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4

## Requisitos previos
- Python 3.13+
- Node.js 18+
- Cuenta de OpenAI con créditos y API key
- Permisos de cámara y micrófono habilitados en el navegador
- Docker Desktop (opcional)

## Características
- ✅ Agente Multimodal (Mini): Orquestación autónoma de herramientas de visión y cámara mediante smolagents.
- ✅ Visión por Computador: Detección de objetos con YOLOv8 y análisis avanzado con GPT-4o Vision.
- ✅ Tiempo Real: Captura de webcam continua con overlays visuales (bounding boxes) actualizados dinámicamente.
- ✅ Audio I/O: Reconocimiento de voz nativo (Whisper) y síntesis de respuestas (Edge-TTS).
- ✅ Memoria Conversacional: Mantenimiento del contexto entre interacciones pasadas y presentes.
- ✅ Modos de Interacción: Modo Imagen, Modo Webcam y Modo Mini (interfaz unificada tipo agente).
- ✅ Internacionalización: Soporte completo para 6 idiomas (ES, EN, FR, DE, IT, PT) guardado en localStorage.
- ✅ Manual de Usuario Interactivo: Guía modal integrada explicativa de atajos y modos de uso.
- ✅ Análisis de colores dominantes con HSV
- ✅ Historial de consultas con miniaturas

## Endpoints disponibles
- `GET  /` — Estado de la API
- `POST /api/analyze` — Analiza imagen estática
- `POST /api/analyze-frame` — Analiza frame de webcam
- `POST /api/analyze-color` — Análisis de colores HSV
- `POST /api/chat` — Chat con memoria conversacional
- `POST /api/stt/transcribe` — Transcripción de audio a texto
- `POST /api/tts/synthesize` — Síntesis de texto a audio
- `POST /api/mini` — Endpoint principal de orquestación del agente multimodal (SmolAgents)

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

### 2. Instalar dependencias
Instala las librerias necesarias.

```bash
pip install fastapi uvicorn ultralytics openai pillow numpy python-multipart python-dotenv smolagents faster-whisper edge-tts

# Si existe el archivo requirements.txt:
pip install -r requirements.txt
```
### 3. Redactar dependencias (opcional)
Genera el archivo requirements.txt para facilitar la reproducibilidad del proyecto.

```bash
pip freeze > requirements.txt
```

### 4. Clonar el repositorio
Clona el repositorio y edita las variables de entorno en .env

```bash
git clone https://github.com/josegicar/multimodal-vision-tfg.git
cd multimodal-vision-tfg
```

### 5. Modificaciones para cada área de trabajo

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
