import os
from smolagents import ToolCallingAgent, OpenAIServerModel
from tools import activar_camara, adjuntar_documento, detecta_objetos_en_imagen
from dotenv import load_dotenv

load_dotenv()

model = OpenAIServerModel(
    model_id="gpt-4o-mini",
    api_key=os.getenv("OPENAI_API_KEY")
)

agent = ToolCallingAgent(
    tools=[activar_camara, adjuntar_documento, detecta_objetos_en_imagen],
    model=model
)

if __name__ == "__main__":
    respuesta = agent.run("Usa la herramienta de detección de objetos sobre la imagen 'test.jpeg' para responder: ¿qué ves?")
    print(respuesta)