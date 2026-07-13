# multimodal-vision-tfg
Proyecto de TFG centrado en la creación de un agente multimodal con FastAPI y React. Implementa un pipeline de visión artificial (YOLO, OpenCV) y procesamiento de lenguaje natural para responder consultas por voz y texto sobre objetos detectados en cámara.

## Estado actual
- ✅ Fase 0 — Asistente visual con imagen estática
- 🔄 Fase 1 — Webcam en tiempo real (en progreso)

## Stack
- **Backend**: FastAPI + YOLOv8 + GPT-4o Vision
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4

## Requisitos previos
- Python 3.10+
- Node.js 18+

# Primeros pasos

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
pip install fastapi uvicorn ultralytics openai pillow numpy python-multipart dotenv

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
