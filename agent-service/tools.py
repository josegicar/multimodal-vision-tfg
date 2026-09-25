import base64
import os
import httpx
import easyocr
import cv2
import numpy as np
from smolagents import tool

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Variable global para el lector OCR (Lazy loading para no bloquear el inicio)
ocr_reader = None
_current_frame_base64 = ""
_last_detections = []

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
        global _last_detections
        _last_detections = result.get('detections', [])

        return (f"Respuesta: {result['answer']}\n"
                f"Detecciones: {result['detections']}\n\n"
                f"INSTRUCCIÓN OBLIGATORIA: Si el usuario te ha pedido explícitamente buscar, encontrar, señalar o te pregunta dónde está un objeto concreto, "
                f"añade exactamente la etiqueta [POINT_TO] al final de tu respuesta.")

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
        global _last_detections
        _last_detections = result.get('detections', [])
        return (f"Respuesta: {result['answer']}\n"
                f"Detecciones: {result['detections']}\n\n"
                f"INSTRUCCIÓN OBLIGATORIA: Si el usuario te ha pedido explícitamente buscar, encontrar, señalar o te pregunta dónde está un objeto concreto, persona o texto, "
                f"añade exactamente la etiqueta [POINT_TO] al final de tu respuesta.")

@tool
def buscar_texto_en_imagen(texto_buscar: str, ruta_imagen: str = "") -> str:
    """
    Busca un texto o palabra específica dentro de una imagen usando OCR y guarda sus coordenadas.
    Usa esta herramienta EXCLUSIVAMENTE cuando el usuario pida leer, buscar o localizar un texto o palabra.
    
    Args:
        texto_buscar: La palabra exacta que el usuario quiere encontrar (ej: 'Patata').
        ruta_imagen: La ruta de la imagen si se proporcionó en el prompt. Si es la webcam, déjalo vacío ("").
    """
    global ocr_reader, _last_detections, _current_frame_base64
    
    if ocr_reader is None:
        # Arrancamos el modelo OCR para español, inglés, francés, alemán, italiano y portugués
        ocr_reader = easyocr.Reader(['es', 'en', 'fr', 'de', 'it', 'pt'], gpu=True)
        
    img = None
    # 1. Intentar cargar la imagen estática
    if ruta_imagen and os.path.exists(ruta_imagen):
        img = cv2.imread(ruta_imagen)
    # 2. Intentar cargar el frame de la webcam
    elif _current_frame_base64:
        encoded_data = _current_frame_base64.split(',')[1] if ',' in _current_frame_base64 else _current_frame_base64
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
    if img is None:
        return "Error: No se encontró imagen o frame de webcam para analizar."

    # Ejecutar EasyOCR
    resultados = ocr_reader.readtext(img)
    texto_buscar_lower = texto_buscar.lower().replace(" ", "")
    
    for (bbox, texto_detectado, prob) in resultados:
        if texto_buscar_lower in texto_detectado.lower().replace(" ", ""):
            # EasyOCR devuelve 4 puntos: [top-left, top-right, bottom-right, bottom-left]
            # Los convertimos al formato de YOLO [x1, y1, x2, y2]
            x_coords = [p[0] for p in bbox]
            y_coords = [p[1] for p in bbox]
            
            x1, y1 = min(x_coords), min(y_coords)
            x2, y2 = max(x_coords), max(y_coords)
            
            # "Disfrazamos" el OCR como una detección de YOLO
            _last_detections.append({
                'class': f'Texto: {texto_detectado}',
                'confidence': float(prob),
                'bbox': [float(x1), float(y1), float(x2), float(y2)]
            })
            
            return f"Éxito: Encontré el texto '{texto_detectado}' con una confianza del {prob*100:.0f}%."
            
    return f"Fracaso: No pude encontrar la palabra '{texto_buscar}' en la imagen."