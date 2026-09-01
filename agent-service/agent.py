import os
from smolagents import ToolCallingAgent, OpenAIServerModel
from tools import responder_directamente, activar_camara, adjuntar_documento, detecta_objetos_en_imagen, analiza_color_en_imagen, analiza_frame_webcam
from dotenv import load_dotenv

load_dotenv()

model = OpenAIServerModel(
    model_id="gpt-4o-mini",
    api_key=os.getenv("OPENAI_API_KEY")
)

# Definimos el comportamiento base de Mini
MINI_SYSTEM_PROMPT = """Eres Mini, un asistente de Inteligencia Artificial multimodal integrado en una aplicación web.
Tu objetivo es ayudar al usuario combinando tus capacidades conversacionales con herramientas de visión por computador.
- Tienes acceso a la cámara web del usuario y a las imágenes que suba.
- Eres capaz de detectar objetos, analizar colores y procesar frames en tiempo real.
- Sé directo, amable y conciso en tus respuestas. 
- Adapta tu idioma al idioma en el que te hable el usuario."""

def create_agent():
    return ToolCallingAgent(
        tools=[responder_directamente, activar_camara, adjuntar_documento, detecta_objetos_en_imagen, analiza_color_en_imagen, analiza_frame_webcam],
        model=model,
        max_steps=4,
        system_prompt=MINI_SYSTEM_PROMPT
    )

if __name__ == "__main__":
    agent = create_agent()
    respuesta = agent.run("Usa la herramienta de detección de objetos sobre la imagen 'test.jpeg' para responder: ¿qué ves?")
    print(respuesta)