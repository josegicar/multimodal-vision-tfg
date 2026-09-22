# Diario de Sesiones

## Sesión 1 - 31/03/2026
- Tiempo: 52min
- Logros: Iniciar app de FastAPI con main.py de la propuesta, crear venv con las librerías necesarias del main.py para ejecutar la app con uvicorn
- Próximos pasos: Editar Backend para conectarlo con OpenAi y YOLO para analizar imágenes

## Sesión 2 — 02/04/2026
- Tiempo: 1h18min
- Logros: Backend MVP funcional, YOLO detectando objetos, OpenAI respondiendo
- Problemas encontrados: Crear api key de OpenAI y añadir el mínimo de 5€ de créditos, crear venv con las librerías necesarias
- Próximos pasos: Frontend básico en React

## Sesión 3 — 02/06/2026
- Tiempo: 1h17min
- Logros: Repo limpio en GitHub, .gitignore correcto, yolov8n.pt eliminado del repo y primera versión del frontend creada
- Problemas encontrados: yolov8n.pt subido por error al repo
- Próximos pasos: Frontend más desarrollado en React

## Sesión 4 - 12/07/2026
- Tiempo: 40 min
- Logros: Icono de la página web creado y rediseño de la página con Tailwind CSS, favicon personalizado en el tab del navegador, bounding boxes
  con OverlayCanvas funcionando sobre la imagen analizada
- Problemas encontrados: Tailwind v4 solo necesita una línea en index.css y App.tsx tenía estilos inline incompatibles con Tailwind que había que
  sustituir completamente
- Próximos pasos: Añadir captura de webcam en tiempo real (Fase 1) / Mejorar la interfaz y experiencia de los usuarios

## Sesión 5 — 13/07/2026
- Tiempo: 2h12min
- Logros: GPT-4o Vision integrado para analizar imágenes directamente (no solo detecciones de YOLO),
  historial de consultas con miniaturas y expansión al pulsar, selector de idioma global con Context API
  (español, inglés, francés, alemán, italiano, portugués), navbar integrada con logo y título traducido,
  toda la UI traducida dinámicamente al cambiar de idioma
- Problemas encontrados: YOLO no detecta objetos en logos/ilustraciones al estar entrenado solo con
  objetos del mundo real
- Próximos pasos: Añadir captura de webcam en tiempo real (Fase 1)

## Theory Session - 18/07/2026
[SmolAgents](https://www.youtube.com/watch?v=uzskhpH5fvo "Build Multi-Agents Systems with SmolAgents")
- Tiempo: 26 min
- Logros: Aprender sobre SmolAgents y cómo poder usarlo en mi proyecto.

## Sesión 6 - 03/08/2026
- Tiempo: 2h43min
- Logros: Selector de modo imagen/webcam integrado en la card principal, componente WebcamCapture creado con captura de frames en tiempo real, 
  nuevo endpoint /api/analyze-frame para frames en base64, overlay de bounding boxes en tiempo real sobre el video de la webcam, polling cada 
  10 segundos para enviar frames al backend
- Problemas encontrados: Rate limit de OpenAI agotado por polling bajo, video no estaba listo al capturar el primer frame y  añadí delay de 1s,
  historial acumulaba entradas duplicadas por cada frame analizado
- Próximos pasos: Estabilizar webcam, integrar smolagents como orquestador de herramientas
  (recomendado por tutor)

## Sesión 7 — 05/08/2026
- Tiempo: 3h28min
- Logros: Webcam estable con polling cada 3 segundos, bounding boxes de YOLO sobre 
  el video en directo, historial funcionando correctamente con entradas cada 3 segundos,
  internacionalización completa de todos los textos de la webcam, iconos con lucide-react,
  manejo de rate limit de OpenAI, release v0.2.0 publicada
- Problemas encontrados: Rate limit de OpenAI agotado por polling demasiado agresivo,
  video no preparado al capturar primer frame
- Próximos pasos: Memoria conversacional entre preguntas, docker básico y análisis de color

## Sesión 8 - 10/08/2026
- Tiempo: 3h02min
- Logros: Ánalisis de color HSV, inicio del desarrollo de la memoria conversacional y preparación inicial del entorno con Docker.
- Problemas encontrados: La memoria conversacional no llegó a funcionar del todo de forma fluida.

## Sesión 9 — 15/08/2026
- Tiempo: 4h32min
- Logros: Memoria conversacional con /api/chat, detección de preguntas sobre el pasado para 
  no mandar imagen actual, modo conversación con trigger manual en webcam, foto del frame guardada
  en historial, historial centrado con card principal, Docker funcionando con docker-compose, localStorage 
  para recordar idioma y arreglos de la IU.
- Problemas encontrados: libgl1-mesa-glx obsoleto en Debian trixie, 
  env_file mal configurado en docker-compose, LLM priorizaba imagen actual 
  sobre historial resuelto detectando keywords de tiempo pasado
- Próximos pasos: Reconocimiento de voz (Whisper STT), síntesis de voz (Coqui TTS), servicio de
  audio separado, WebSockets o Smolagents

## Sesión 10 — 29/08/2026
- Tiempo: 2h25min
- Logros: Whisper STT integrado con faster-whisper, componente AudioInput con 
  botón de micrófono junto al input de texto, transcripción automática al soltar 
  el botón, textarea auto-redimensionable con scrollbar oculto, política de ramas 
  Git Flow simplificado documentada en CONTRIBUTING.md con rama develop
- Problemas encontrados: faster-whisper no instalado en Docker al no actualizar 
  requirements.txt, permisos de micrófono bloqueados en el navegador, scrollbar 
  nativo del textarea con aspecto feo resuelto con CSS
- Próximos pasos: smolagents como orquestador, TTS

## Sesión 11 — 30/08/2026
- Tiempo: 6h10min
- Logros: TTS integrado con edge-tts y componente AudioOutput con voces en 
  6 idiomas, botón de audio en respuestas e historial, renombrado a Asistente 
  Mini con título de pestaña fijo, subtítulo actualizado, textarea 
  auto-redimensionable con scrollbar oculto, área de subida más compacta,
  archivo config.ts creado para centralizar API_URL, screenshot de fase 2 
  añadido a docs/screenshots.
- Problemas encontrados: Coqui TTS no compatible con Python 3.13, edge-tts 
  como alternativa open-source compatible, currentTime de HTMLAudioElement 
  no modificable directamente desde useState resuelto con useRef, modelo Whisper 
  base con precisión insuficiente mejorado cambiando a small con vad_filter=True 
  para filtrar silencios automáticamente
- Próximos pasos: smolagents como orquestador de herramientas

## Sesión 12 — 31/08/2026
- Tiempo: 2h 37min
- Logros: Sincronización global de animaciones CSS (gradientes) en los botones de la interfaz
  calculando el delay de forma dinámica mediante refs del DOM, primeros pasos de integración
  con smolagents.
- Problemas encontrados: Desincronización de animaciones CSS al montar/desmontar componentes
  en React y al cambiar pestañas, fallo de validación BaseTool en smolagents al pasar funciones
  puras en lugar de instanciar las herramientas, que fue solucionado aplicando el decorador @tool.
- Próximos pasos: Desarrollar la interfaz visual limpia del "Modo Mini" tipo agente y conectar 
  completamente las órdenes JSON del agente autónomo con la ejecución de hardware (cámara/archivos) 
  en el frontend.

## Sesión 13 - 01/09/2026
- Tiempo: 7h 32min
- Logros: Completada la integración de smolagents permitiendo que Mini funcione como un agente
  multimodal autónomo (capaz de enrutar tareas y ejecutar herramientas para cámara y archivos). Interfaz del "Modo Mini" finalizada con comportamiento de textarea unificado. Desarrollo e integración de un manual de usuario interactivo mediante un modal con soporte multilenguaje completo para todos los idiomas de la aplicación.
- Problemas encontrados: Tener que implementar las tools y aportar unas correctas tasks para evitar
  fallos o problemas del modo conversación, quitar foto o cámara cuando se pone la opción opuesta, el scroll del fondo de la página seguía activo al abrir el modal, lo que causaba saltos extraños.
- Próximos pasos: Mostrar la aplicación completa y funcional al tutor (Fase 2 cerrada). Iniciar la fase
  de pruebas (testing) de componentes frontend y/o E2E aislando el trabajo en la rama test/.

## Sesión 14 — 10/09/2026
- Tiempo: 4h 15min
- Logros: Implementación completa del sistema de temas Claro/Oscuro
  (Light/Dark Mode) mediante variantes de Tailwind CSS.
- Próximos pasos: Mostrar la aplicación completa, funcional y pulida al
  tutor (Fase 2 cerrada). Iniciar la fase de pruebas (testing) de componentes frontend y/o E2E aislando el trabajo en la rama test/.