import httpx
from smolagents import tool

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
            "http://localhost:8000/api/analyze",
            files=files,
            data=data,
            timeout=30.0
        )
        result = response.json()
        return f"Respuesta: {result['answer']}\nDetecciones: {result['detections']}"