# multimodal-vision-tfg
Proyecto de TFG centrado en la creación de un agente multimodal con FastAPI y React. Implementa un pipeline de visión artificial (YOLO, OpenCV) y procesamiento de lenguaje natural para responder consultas por voz y texto sobre objetos detectados en cámara.

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

# Extrae el archivo .env.example como .env a la raíz de tu proyecto y edita las variables:
cp .env.example .env
```

# Iniciar el server de uvicorn

```bash
cd backend
uvicorn main:app --reload
```
