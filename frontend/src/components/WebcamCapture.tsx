import { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, Square } from 'lucide-react'
import { API_URL } from '../config'
import { useLanguage } from '../context/LanguageContext'
import axios from 'axios'

const POLLING_INTERVAL = 10000 // ms entre cada análisis

interface Detection {
  class: string
  confidence: number
  bbox: number[]
}

interface WebcamResult {
  answer: string
  detections: Detection[]
  frameBase64: string
}

interface Props {
  query: string
  conversationMode: boolean
  conversationHistory: string
  trigger: number
  onResult: (result: WebcamResult & { history?: string }) => void
  onActiveChange?: (isActive: boolean) => void
}

export function WebcamCapture({ query, conversationMode, conversationHistory, trigger, onResult, onActiveChange }: Props) {
  const { language, t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [error, setError] = useState('')
  const [detections, setDetections] = useState<Detection[]>([])

  const requestRefs = useRef({ query, language, conversationMode, conversationHistory, trigger, onResult, onActiveChange})

  useEffect(() => {
    requestRefs.current = { query, language, conversationMode, conversationHistory, trigger, onResult, onActiveChange }
  }, [query, language, conversationMode, conversationHistory, trigger, onResult, onActiveChange])

  // Dibuja bounding boxes sobre el overlay
  const drawOverlay = useCallback((dets: Detection[]) => {
    const overlay = overlayRef.current
    const video = videoRef.current
    if (!overlay || !video) return

    overlay.width = video.videoWidth
    overlay.height = video.videoHeight
    const ctx = overlay.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, overlay.width, overlay.height)

    dets.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox
      const w = x2 - x1
      const h = y2 - y1

      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 3
      ctx.strokeRect(x1, y1, w, h)

      const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(x1, y1 - 24, label.length * 8, 24)
      ctx.fillStyle = '#000000'
      ctx.font = '16px Arial'
      ctx.fillText(label, x1 + 4, y1 - 6)
    })
  }, [])

  // Captura un frame y lo envía al backend
  const analyzeFrame = useCallback(async () => {
    const { 
    query: currentQuery, 
    language: currentLang, 
    onResult: currentOnResult,
    conversationMode: currentConvMode,
    conversationHistory: currentHistory
  } = requestRefs.current

    if (!currentQuery || loading) return

    const video = videoRef.current
    if (!video || video.readyState < 2) return
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const frameBase64 = canvas.toDataURL('image/jpeg', 0.7)

    console.log('Modo conversación:', currentConvMode)
    console.log('Historial enviado:', currentHistory)

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('frame_base64', frameBase64)
      formData.append('query', currentQuery)
      formData.append('language', currentLang)

      let response

      if (currentConvMode) {
        formData.append('history', currentHistory)
        response = await axios.post<WebcamResult & { history?: string }>(
          `${API_URL}/api/chat`,
          formData
        )
      } else {
        response = await axios.post<WebcamResult>(
          `${API_URL}/api/analyze-frame`,
          formData
        )
      }

      setDetections(response.data.detections)
      drawOverlay(response.data.detections)
      currentOnResult({ ...response.data, frameBase64 })
    } catch {
      setError(t.analyzeError)
    } finally {
      setLoading(false)
    }
  }, [loading, drawOverlay, t.analyzeError])

  // Activa la webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 , facingMode: "user" }
      })
      streamRef.current = stream
      setActive(true)
      setError('')
    } catch {
      setError(t.webcamError)
    }
  }

  // Desactiva la webcam
  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setActive(false)
    setDetections([])
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d')
      ctx?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
    }
  }

  // Engancha el stream al vídeo
  useEffect(() => {
    if (active && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [active])

  // Avisa a App.tsx cuando 'active' cambie
  useEffect(() => {
    if (onActiveChange) {
      onActiveChange(active)
    }
  }, [active, onActiveChange])

  // Arranca el polling cuando hay webcam activa y query escrita
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    
    if (active && query && videoReady && !conversationMode) {
      timeoutId = setTimeout(() => {
        analyzeFrame()
        intervalRef.current = setInterval(analyzeFrame, POLLING_INTERVAL)
      }, 1000)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, query, videoReady, conversationMode, analyzeFrame])

  // Modo conversación
  useEffect(() => {
    if (trigger > 0 && active && videoReady && conversationMode) {
      const timerId = setTimeout(() => {
        analyzeFrame()
      }, 0)

      return () => clearTimeout(timerId)
    }
    // Silenciamos el linter porque solo queremos escuchar a 'trigger'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  // Limpia al desmontar
  useEffect(() => {
    return () => stopWebcam()
  }, [])

  return (
    <div className="flex flex-col gap-4">

      {/* Botón activar/desactivar */}
      <button
        onClick={active ? stopWebcam : startWebcam}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          active
            ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
      >
        {active ? (
          <>
            <Square size={18} fill="currentColor" />
            <span>{t.stopWebcam}</span>
          </>
        ) : (
          <>
            <Camera size={18} />
            <span>{t.startWebcam}</span>
          </>
        )}
      </button>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      {/* Video + overlay */}
      {active && (
        <div className="relative rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onCanPlay={() => setVideoReady(true)}
            className="w-full rounded-xl"
          />
          <canvas
            ref={overlayRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          {loading && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
              {t.analyzing}
            </div>
          )}
        </div>
      )}

      {/* Canvas oculto para capturar frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Detecciones actuales */}
      {active && detections.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-blue-400 font-semibold mb-2 text-sm">{t.detections}</h3>
          <ul className="flex flex-col gap-1">
            {detections.map((det, i) => (
              <li key={i} className="flex justify-between text-xs text-gray-300">
                <span>{det.class}</span>
                <span className={det.confidence > 0.7 ? 'text-green-400' : 'text-yellow-400'}>
                  {(det.confidence * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}