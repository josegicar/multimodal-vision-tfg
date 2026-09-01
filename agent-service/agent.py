import os
from smolagents import ToolCallingAgent, OpenAIServerModel
from tools import responder_directamente, activar_camara, adjuntar_documento, detecta_objetos_en_imagen, analiza_color_en_imagen, analiza_frame_webcam
from dotenv import load_dotenv

load_dotenv()

model = OpenAIServerModel(
    model_id="gpt-4o-mini",
    api_key=os.getenv("OPENAI_API_KEY")
)

def create_agent():
    return ToolCallingAgent(
        tools=[responder_directamente, activar_camara, adjuntar_documento, detecta_objetos_en_imagen, analiza_color_en_imagen, analiza_frame_webcam],
        model=model,
        max_steps=4
    )

if __name__ == "__main__":
    agent = create_agent()
    respuesta = agent.run("Usa la herramienta de detección de objetos sobre la imagen 'test.jpeg' para responder: ¿qué ves?")
    print(respuesta)