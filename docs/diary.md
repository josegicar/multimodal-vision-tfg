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