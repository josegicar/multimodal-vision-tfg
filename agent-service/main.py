from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import json
from agent import create_agent
from tools import set_current_frame

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_TURNS = 12

@app.get("/")
async def root():
    return {"status": "ok", "message": "Asistente Mini funcionando"}

@app.post("/api/mini")
async def mini_endpoint(
    query: str = Form(...),
    language: str = Form(default="es"),
    image: UploadFile = File(None),
    frame_base64: str = Form(default=""),
    history: str = Form(default="[]"),
):
    try:
        conv_history = json.loads(history)
    except Exception:
        conv_history = []

    history_text = "\n".join(
        f"{'Usuario' if m['role']=='user' else 'Mini'}: {m['content'] if isinstance(m['content'], str) else '[mensaje con imagen]'}"
        for m in conv_history
    )
    history_block = (
        f"=== HISTORIAL DE MENSAJES ANTERIORES (NO es la pregunta actual) ===\n"
        f"{history_text}\n"
        f"=== FIN DEL HISTORIAL ===\n\n"
        f"Ahora responde ÚNICAMENTE a la NUEVA pregunta del usuario que aparece más abajo, "
        f"usando el historial de arriba solo como contexto si es relevante.\n\n"
    ) if history_text else ""
    
    image_path = None
    if image and image.filename:
        suffix = os.path.splitext(image.filename)[1] or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await image.read())
            image_path = tmp.name

    try:
        if image_path:
            task = (
                f"{history_block}"
                f"Te llamas Mini, y el usuario ha subido una imagen guardada en la ruta '{image_path}'. "
                f"Responde en idioma '{language}'.\n\n"
                f"INSTRUCCIÓN CRÍTICA:\n"
                f"- Si la pregunta es solo sobre el CONTENIDO VISUAL de la imagen actual (qué hay, "
                f"qué colores, qué objetos), usa 'detecta_objetos_en_imagen' o 'analiza_color_en_imagen'.\n"
                f"- Si la pregunta es solo sobre el HISTORIAL (qué dijiste antes, qué te pedí antes), "
                f"responde con 'responder_directamente' usando el historial de arriba, SIN llamar a "
                f"herramientas de imagen.\n"
                f"- Si la pregunta pide COMPARAR la imagen actual con algo anterior (ej: 'compara esta "
                f"imagen con la anterior', '¿qué ha cambiado?'), primero usa 'detecta_objetos_en_imagen' "
                f"para obtener una descripción de la imagen actual, y después usa 'responder_directamente' "
                f"para dar tu respuesta final combinando esa descripción con la información del historial.\n"
                f"Después de la última llamada a herramienta, llama INMEDIATAMENTE a 'final_answer'.\n"
                f"Pregunta del usuario: {query}"
            )
        elif frame_base64:
            set_current_frame(frame_base64)
            task = (
                f"{history_block}"
                f"Te llamas Mini, y el usuario tiene la webcam activa ahora mismo. Responde en idioma '{language}'.\n\n"
                f"INSTRUCCIÓN CRÍTICA:\n"
                f"- Si la pregunta es solo sobre lo que la webcam ve AHORA (qué ves, hay algo, describe "
                f"la cámara), usa 'analiza_frame_webcam'.\n"
                f"- Si la pregunta es solo sobre el HISTORIAL (qué dijiste antes, qué veías antes), "
                f"responde con 'responder_directamente' usando el historial de arriba, SIN llamar a "
                f"'analiza_frame_webcam'.\n"
                f"- Si la pregunta pide COMPARAR lo que ves ahora con algo anterior (ej: 'compara con "
                f"lo que veías antes', '¿qué ha cambiado?'), primero usa 'analiza_frame_webcam' para "
                f"obtener la descripción actual, y después usa 'responder_directamente' para dar tu "
                f"respuesta final combinando esa descripción con la información del historial.\n"
                f"Después de la última llamada a herramienta, llama INMEDIATAMENTE a 'final_answer'.\n"
                f"Pregunta del usuario: {query}"
            )
        else:
            task = (
                f"{history_block}"
                f"Te llamas Mini y responde en idioma '{language}' a este mensaje del usuario: \"{query}\"\n\n"
                f"INSTRUCCIÓN CRÍTICA:\n"
                f"0. MEMORIA: Si el usuario pregunta por mensajes anteriores (ej: '¿qué te acabo de decir?', '¿cuál fue mi último mensaje?'), "
                f"lee el bloque '=== HISTORIAL DE MENSAJES ANTERIORES ==='.\n"
                f"El último mensaje del usuario es EXACTAMENTE la última línea que empieza por 'Usuario: ' dentro de ese bloque. No omitas ninguna pregunta.\n"
                f"¡MUY IMPORTANTE! La nueva pregunta que estás leyendo en este momento NO es un mensaje anterior. "
                f"Si el historial está vacío, informa amablemente de que no tienes registro.\n"
                f"1. Si el usuario pide subir, analizar, adjuntar una foto/imagen/documento "
                f"(ej: 'quiero subir una foto', 'analiza esta imagen', 'sube un documento'), "
                f"llama a 'adjuntar_documento' y usa su resultado como respuesta final.\n"
                f"2. Si el usuario pide encender, activar, usar la cámara o webcam "
                f"(ej: 'enciende la cámara', 'quiero usar la webcam'), "
                f"llama a 'activar_camara' y usa su resultado como respuesta final.\n"
                f"3. Para saludos o charla casual sin relación con el historial, "
                f"llama a 'responder_directamente' UNA SOLA VEZ con tu respuesta.\n"
                f"En todos los casos, después de la primera llamada a herramienta, llama "
                f"INMEDIATAMENTE a 'final_answer' con ese mismo texto. NO llames a la misma "
                f"herramienta más de una vez ni mezcles varias herramientas en la misma respuesta."
            )

        agent = create_agent()
        raw_answer = str(agent.run(task))

        action = None
        clean_answer = raw_answer
        if "[ACTIVATE_WEBCAM]" in raw_answer:
            action = "ACTIVATE_WEBCAM"
            clean_answer = raw_answer.replace("[ACTIVATE_WEBCAM]", "").strip()
        elif "[OPEN_FILE_PICKER]" in raw_answer:
            action = "OPEN_FILE_PICKER"
            clean_answer = raw_answer.replace("[OPEN_FILE_PICKER]", "").strip()
            
        new_history = conv_history + [
            {"role": "user", "content": query},
            {"role": "assistant", "content": clean_answer}
        ]
        new_history = new_history[-MAX_TURNS:]

        return {
            "answer": clean_answer,
            "action": action,
            "detections": [],
            "history": json.dumps(new_history)
        }

    except Exception as e:
        return {
            "answer": f"Error en el agente: {str(e)}",
            "action": None,
            "detections": [],
            "history": history
        }
    finally:
        if image_path and os.path.exists(image_path):
            os.remove(image_path)