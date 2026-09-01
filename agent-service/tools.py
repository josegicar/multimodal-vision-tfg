import base64
import os
import httpx
from smolagents import tool

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

_current_frame_base64 = ""

def set_current_frame(frame_base64: str):
    global _current_frame_base64
    _current_frame_base64 = frame_base64

@tool
def responder_directamente(mensaje: str) -> str:
    """
    Usa esta herramienta para saludos, charla casual, o cualquier pregunta que 
    NO requiera ver una imagen ni activar la cámara. Simplemente devuelve tu 
    respuesta como texto natural.

    Args:
        mensaje: La respuesta que quieres dar al usuario.

    Returns:
        El mismo mensaje, sin modificar.
    """
    return mensaje

@tool
def activar_camara() -> str:
    """
    Usa esta herramienta cuando el usuario pida encender, usar, abrir o mirar por la cámara/webcam.
    """
    return "Comando de cámara detectado. Responde amigablemente al usuario y añade exactamente el texto [ACTIVATE_WEBCAM] al final de tu respuesta."

@tool
def adjuntar_documento() -> str:
    """
    Usa esta herramienta cuando el usuario pida subir, analizar o adjuntar un documento, foto o imagen desde sus archivos.
    """
    return "Comando de archivo detectado. Responde amigablemente al usuario y añade exactamente el texto [OPEN_FILE_PICKER] al final de tu respuesta."

@tool
def detecta_objetos_en_imagen(image_path: str, query: str, language: str = "es") -> str:
    """
    Detecta objetos en una imagen y responde una pregunta sobre ella usando visión por computador (YOLO) y un modelo de lenguaje multimodal (GPT-4o).

    Args:
        image_path: Ruta local al archivo de imagen a analizar.
        query: Pregunta en lenguaje natural sobre la imagen.
        language: Idioma de la respuesta (por defecto "es").

    Returns:
        Una cadena de texto con la respuesta del asistente y los objetos detectados.
    """
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    with httpx.Client() as client:
        files = {"image": ("image.jpg", image_bytes, "image/jpeg")}
        data = {"query": query, "language": language}
        response = client.post(
            f"{BACKEND_URL}/api/analyze",
            files=files,
            data=data,
            timeout=30.0
        )
        result = response.json()
        return f"Respuesta: {result['answer']}\nDetecciones: {result['detections']}"

@tool
def analiza_color_en_imagen(image_path: str, language: str = "es") -> str:
    """
    Analiza los colores dominantes de una imagen mediante HSV.

    Args:
        image_path: Ruta local al archivo de imagen a analizar.
        language: Idioma de la respuesta (por defecto "es").

    Returns:
        Los colores dominantes detectados con sus porcentajes.
    """
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    frame_base64 = f"data:image/jpeg;base64,{b64}"

    with httpx.Client() as client:
        data = {"frame_base64": frame_base64, "language": language}
        response = client.post(
            f"{BACKEND_URL}/api/analyze-color",
            data=data,
            timeout=30.0
        )
        result = response.json()
        colors = result.get("colors", [])
        dominant = result.get("dominant", "indeterminado")
        colors_str = ", ".join(f"{c['name']} ({c['percentage']}%)" for c in colors) or "ninguno detectado"
        return f"Color dominante: {dominant}\nTodos los colores: {colors_str}"

@tool
def analiza_frame_webcam(query: str, language: str = "es") -> str:
    """
    Analiza el frame actual de la webcam del usuario (ya cargado en el sistema) para
    responder una pregunta, usando visión por computador (YOLO) y GPT-4o.

    Args:
        query: Pregunta en lenguaje natural sobre lo que se ve en la webcam.
        language: Idioma de la respuesta (por defecto "es").

    Returns:
        Una cadena de texto con la respuesta del asistente y los objetos detectados.
    """
    global _current_frame_base64
    if not _current_frame_base64:
        return "No hay ningún frame de webcam disponible en este momento."

    with httpx.Client() as client:
        data = {"frame_base64": _current_frame_base64, "query": query, "language": language}
        response = client.post(
            f"{BACKEND_URL}/api/analyze-frame",
            data=data,
            timeout=30.0
        )
        result = response.json()
        return f"Respuesta: {result['answer']}\nDetecciones: {result.get('detections', [])}"