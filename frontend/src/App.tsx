import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { API_URL, AGENT_URL } from './config'
import { Navbar } from './components/Navbar'
import { OverlayCanvas } from './components/OverlayCanvas'
import { useLanguage } from './context/LanguageContext'
import { WebcamCapture, type WebcamCaptureHandle } from './components/WebcamCapture'
import { AudioInput } from './components/AudioInput'
import { AudioOutput } from './components/AudioOutput'
import { syncGradient } from './utils/animations'
import { Image as ImageIcon, Camera, Search, FolderOpen, Trash2, Info, X, Keyboard } from 'lucide-react'

interface Detection {
  class: string
  confidence: number
  bbox: number[]
}

interface AnalyzeResponse {
  answer: string
  detections: Detection[]
}

interface HistoryEntry {
  query: string
  answer: string
  preview: string
  detections: Detection[]
}

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<'image' | 'webcam' | 'mini'>('image')
  const [conversationMode, setConversationMode] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<string>('[]')
  const [audioLoading, setAudioLoading] = useState(false)
  const [webcamTrigger, setWebcamTrigger] = useState(0)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [isManualOpen, setIsManualOpen] = useState(false)

  const { language, t } = useLanguage()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const webcamRef = useRef<WebcamCaptureHandle>(null)

  useEffect(() => {
    document.title = 'Mini'
  }, [t.title])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [query, mode])

  useEffect(() => {
    if (isManualOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isManualOpen])

  useEffect(() => {
    if (mode !== 'mini') return

    const container = miniContainerRef.current
    const logo = miniLogoRef.current
    if (!container || !logo) return

    let x = Math.random() * (container.clientWidth - 140)
    let y = Math.random() * (container.clientHeight - 140)
    
    let dx = 1
    let dy = 1
    let animationFrameId: number

    const animate = () => {
      if (!container || !logo) return
      
      const bounds = container.getBoundingClientRect()
      const logoSize = 140 

      if (x + logoSize >= bounds.width || x <= 0) dx = -dx
      if (y + logoSize >= bounds.height || y <= 0) dy = -dy

      x += dx
      y += dy

      logo.style.transform = `translate(${x}px, ${y}px)`
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [mode])

  // Atajo de teclado global: Ctrl + M (o Cmd + M en Mac) para el micrófono
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        const activeMicButton = document.querySelector('.mic-trigger-btn') as HTMLButtonElement
        if (activeMicButton) activeMicButton.click()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleModeChange = (newMode: 'image' | 'webcam' | 'mini') => {
    setMode(newMode)
    setResult(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      if (isWebcamActive) {
        webcamRef.current?.stop()
        setIsWebcamActive(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (mode !== 'mini' && (!image || !query)) return
    if (mode === 'mini' && !query) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('query', query)
      formData.append('language', language)

      let response: { data: AnalyzeResponse & { action?: string | null; history?: string } }

      if (mode === 'mini') {
        if (image) formData.append('image', image)
        if (isWebcamActive) {
          const frame = webcamRef.current?.captureCurrentFrame()
          if (frame) formData.append('frame_base64', frame)
        }
        if (conversationMode) {
          formData.append('history', conversationHistory)
        }
        response = await axios.post<AnalyzeResponse & { action?: string | null; history?: string }>(
          `${AGENT_URL}/api/mini`,
          formData
        )
        if (conversationMode && response.data.history) {
          setConversationHistory(response.data.history)
        }
      } else if (conversationMode) {
        formData.append('image', image!)
        formData.append('history', conversationHistory)
        response = await axios.post<AnalyzeResponse & { history?: string }>(
          `${API_URL}/api/chat`,
          formData
        )
        if (response.data.history) {
          setConversationHistory(response.data.history)
        }
      } else {
        formData.append('image', image!)
        response = await axios.post<AnalyzeResponse & { action?: string | null; history?: string }>(
          `${API_URL}/api/analyze`,
          formData
        )
      }

      const result = response.data

      let shouldShowResult = true

      if ('action' in result) {
        if (result.action === 'ACTIVATE_WEBCAM') {
          handleModeChange('webcam')
          setIsWebcamActive(true)
          shouldShowResult = false
        } else if (result.action === 'OPEN_FILE_PICKER') {
          handleModeChange('image')
          setTimeout(() => fileInputRef.current?.click(), 100)
          shouldShowResult = false
        } else if (result.action === 'SPEAK_LAST') {
          setTimeout(() => {
            const latestAudioBtn = document.querySelector('.audio-speaker-btn') as HTMLButtonElement
            if (latestAudioBtn) latestAudioBtn.click()
          }, 100)
          shouldShowResult = false
        }
      }

      if (shouldShowResult) {
        setResult(result)
      }

      const minFrame = mode === 'mini' && isWebcamActive ? webcamRef.current?.captureCurrentFrame() : null

      if(result.action !== 'SPEAK_LAST') {
        setHistory(prev => [{
          query,
          answer: result.answer,
          preview: minFrame || preview,
          detections: result.detections || []
        }, ...prev])
      }

      setQuery('')

    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError(t.queryTooLong)
      } else {
        setError(t.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-8">

      <Navbar />

      <div className="flex flex-col items-center px-4 py-8 w-full mt-4">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 
            ref={syncGradient}
            className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent animate-gradient"
          >
            {t.title}
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            {t.subtitle}
            <button 
                onClick={() => setIsManualOpen(true)}
                className="p-1 text-gray-500 hover:text-purple-400 transition-colors rounded-full hover:bg-gray-800"
                title="Info"
              >
                <Info size={18} />
              </button>
          </p>
        </div>

        {/* Layout — card centrada + historial fijo a la derecha */}
        <div className="w-full max-w-[1400px] flex gap-6 items-start justify-center">

          {/* Espaciador invisible para centrar la card */}
          <div className="w-80 flex-shrink-0 invisible hidden lg:block" />

          {/* Card principal centrada */}
          <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-xl p-6 flex flex-col gap-4 z-10">

            {/* Selector de modo */}
            <div className="flex rounded-xl overflow-hidden border border-gray-700">
              <button
                ref={syncGradient}
                onClick={() => handleModeChange('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-all bg-[length:200%_200%] animate-gradient ${
                  mode === 'image'
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <ImageIcon size={18} />
                <span>{t.imageMode}</span>
              </button>

              <button
                ref={syncGradient}
                onClick={() => handleModeChange('webcam')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-all bg-[length:200%_200%] animate-gradient ${
                  mode === 'webcam'
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Camera size={18} />
                <span>{t.webcamMode}</span>
              </button>

              <button
                ref={syncGradient}
                onClick={() => handleModeChange('mini')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-all bg-[length:200%_200%] animate-gradient ${
                  mode === 'mini'
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <img src="/chatbot.svg" alt="Mini" className="w-[18px] h-[18px] rounded-full" />
                <span>Mini</span>
              </button>

            </div>

            {/* Toggle modo conversación */}
            <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold">{t.conversationMode}</span>
                <span className="text-gray-400 text-xs">{t.conversationModeDesc}</span>
              </div>
              <button
                onClick={() => {
                  setConversationMode(!conversationMode)
                  setConversationHistory('[]') // resetea al cambiar modo
                }}
                className={`mb-1 w-12 h-6 rounded-full transition-all ${
                  conversationMode ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all mx-0.5 ${
                  conversationMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {mode === 'mini' ? (
              <div className="relative w-full min-h-[380px] bg-white dark:bg-gray-950 border border-gray-700 rounded-xl overflow-hidden flex flex-col items-center justify-center p-8 transition-colors">

                {/* Capa 1: gradiente radial */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(168,85,247,0.15) 0%, transparent 70%)',
                  }}
                />

                {/* Capa 2: anillos pulsando */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 rounded-full border border-purple-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute w-48 h-48 rounded-full border border-blue-500/20 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                </div>

                {/* Capa 3: icono flotando (Efecto DVD) */}
                <div 
                  ref={miniContainerRef} 
                  className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl"
                >
                  <div 
                    ref={miniLogoRef}
                    className="absolute dark:opacity-10 w-[140px] h-[140px] rounded-full overflow-hidden"
                    style={{ top: 0, left: 0 }}
                  >
                    <img src="/chatbot.svg" alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Cuadro de texto central */}
                <div className="relative z-10 w-full max-w-lg mb-6 flex flex-col items-center gap-4">
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 text-center transition-colors">
                    {t.miniGreeting}
                  </h3>

                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    placeholder={audioLoading ? t.transcribing : t.miniPlaceholder}
                    rows={2}
                    maxLength={1000}
                    className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-500/30 rounded-2xl px-6 py-4 text-gray-900 dark:text-gray-100 text-center text-lg placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-[0_0_100px_rgba(168,85,247,0.15)] transition-all resize-none overflow-y-auto max-h-32"
                  />

                  {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                </div>

                {/* Micro central */}
                <div className="relative z-10 scale-125 flex flex-col items-center gap-2">
                  <AudioInput
                    onTranscription={(text) => setQuery(prev => prev ? `${prev} ${text}` : text)}
                    onLoadingChange={(loading) => setAudioLoading(loading)}
                    onRecordingChange={(recording) => setIsRecordingMini(recording)}
                    showHint={false}
                  />
                </div>

                <p className="relative z-10 mt-4 text-sm h-5 leading-5 text-center">
                  {isRecordingMini ? (
                    <span className="text-red-400 animate-pulse">{t.tapToStopRecording}</span>
                  ) : loading ? (
                    <span className="text-purple-400 animate-pulse">{t.analyzing}</span>
                  ) : (
                    <>
                      <span className="text-gray-500 dark:text-gray-400 block mb-1 transition-colors">{t.tapToSpeak}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700 dark:border-gray-800">
                          <kbd className="font-mono">Ctrl + M</kbd>
                      </span>
                    </>
                  )}
                </p>

                {/* Input file oculto para que la orden [OPEN_FILE_PICKER] lo abra */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : mode === 'image' ? (
              <>
                {/* Upload */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-4 cursor-pointer hover:border-purple-500 transition-colors">
                  <div className="mb-2 text-gray-400">
                    <FolderOpen size={32} strokeWidth={1.5} />
                  </div>
                  {image ? (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-purple-400 font-medium">{image.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setImage(null)
                          setPreview('')
                          setResult(null)
                        }}
                        title={t.clearImage}
                        className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">{t.upload}</span>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {preview && !result && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-xl w-full object-contain max-h-96"
                  />
                )}
                {result && (
                  <OverlayCanvas imageUrl={preview} detections={result.detections} />
                )}

                <div className="flex gap-2 items-end">
                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder={audioLoading ? t.transcribing : t.placeholder}
                    rows={1}
                    maxLength={1000}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none overflow-hidden-y-auto max-h-32"
                  />
                  <AudioInput 
                    onTranscription={(text) => setQuery(prev => prev ? `${prev} ${text}` : text)}
                    onLoadingChange={(loading) => setAudioLoading(loading)}
                  />
                </div>

                <button
                  ref={syncGradient}
                  onClick={handleSubmit}
                  disabled={!image || !query || loading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 bg-[length:200%_200%] animate-gradient hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:[animation-play-state:paused] transition-all"
                >
                  {loading ? t.analyzing : t.analyze}
                </button>

                {error && <p className="text-red-400 text-center">{error}</p>}

                {result && (
                  <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-purple-400 font-semibold">{t.response}</h3>
                        <AudioOutput text={result.answer} />
                      </div>
                      <p className="text-gray-200">{result.answer}</p>
                    </div>
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">{t.detections}</h3>
                      {result.detections.length > 0 ? (
                        <ul className="flex flex-col gap-1">
                          {result.detections.map((det, i) => (
                            <li key={i} className="flex justify-between text-sm text-gray-300">
                              <span>{det.class}</span>
                              <span className={det.confidence > 0.7 ? 'text-green-400' : 'text-yellow-400'}>
                                {(det.confidence * 100).toFixed(0)}%
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">{t.noDetections}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && query && conversationMode && isWebcamActive) {
                        setWebcamTrigger(prev => prev + 1)
                      }
                    }}
                    placeholder={audioLoading ? t.transcribing : t.placeholder}
                    rows={1}
                    maxLength={1000}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none overflow-y-auto max-h-32"
                  />
                  <AudioInput 
                    onTranscription={(text) => setQuery(prev => prev ? `${prev} ${text}` : text)}
                    onLoadingChange={(loading) => setAudioLoading(loading)}
                  />
                  
                  {/* Botón opcional para enviar manualmente en modo conversación */}
                  {conversationMode && (
                    <span 
                      title={!isWebcamActive ? t.activateCameraTooltip : ""}
                      className={`transition-opacity ${
                        conversationMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      } ${!isWebcamActive ? "cursor-not-allowed" : ""}`}
                    >
                      <button
                        ref={syncGradient}
                        onClick={() => setWebcamTrigger(prev => prev + 1)}
                        disabled={!query || loading || !isWebcamActive}
                        className={`h-12 px-6 flex items-center justify-center rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 bg-[length:200%_200%] animate-gradient hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all flex-shrink-0 ${
                          (!query || loading || !isWebcamActive) ? 'pointer-events-none' : ''
                        }`}
                      >
                        {t.send}
                      </button>
                    </span>
                  )}
                </div>

                {result && mode === 'webcam' && (
                  <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-purple-400 font-semibold">{t.response}</h3>
                        <AudioOutput text={result.answer} />
                      </div>
                      <p className="text-gray-200">{result.answer}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className={mode === 'webcam' ? '' : 'hidden'}>
              <WebcamCapture
                isActive={isWebcamActive}
                query={query}
                ref={webcamRef}
                pollingEnabled={mode === 'webcam'}
                conversationMode={conversationMode}
                conversationHistory={conversationHistory}
                trigger={webcamTrigger}
                onActiveChange={(isActive) => {
                  setIsWebcamActive(isActive)
                  if (isActive) {
                    setImage(null)
                    setPreview('')
                  }
                  if (!isActive) setResult(null)
                }}
                onResult={(r) => {
                  setResult(r)
                  if (r.history) setConversationHistory(r.history)
                  if (query) {
                    setHistory(prev => {
                      if (prev[0]?.answer === r.answer) return prev
                      return [{
                        query,
                        answer: r.answer,
                        preview: r.frameBase64 || '',
                        detections: r.detections
                      }, ...prev]
                    })
                  }
                }}
              />
            </div>

          </div>

          {/* Historial fijo a la derecha sin afectar el centro */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-2">
            <div className="flex justify-between items-center pr-1">
              <h2 className="text-xl font-bold text-gray-300">{t.history}</h2>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([])
                    setConversationHistory('[]')
                  }}
                  className="text-sm text-red-500 hover:text-red-300 transition-colors"
                >
                  {t.clear}
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-gray-600 text-sm">{t.historyEmpty}</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-1">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  >
                    <div className="flex gap-3">
                      {entry.preview ? (
                        <img
                          src={entry.preview}
                          alt="thumb"
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img src="/chatbot.svg" alt="Mini" className="w-8 h-8 rounded-full object-cover" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <div className="text-purple-400 text-sm font-semibold truncate flex items-center gap-2">
                          <Search size={14} className="flex-shrink-0" />
                          <span className="truncate" title={entry.query}>{entry.query}</span>
                          <div className="ml-auto flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <AudioOutput text={entry.answer} />
                          </div>
                        </div>
                        <div className={`text-gray-300 text-xs ${expandedIndex === i ? '' : 'line-clamp-3'}`}>
                          {entry.answer}
                        </div>
                        {entry.preview && (
                          <div className="text-gray-500 text-xs mt-1">
                            {entry.detections.length > 0
                              ? t.detectedObjects(entry.detections.length)
                              : t.noDetections}
                          </div>
                        )}
                      </div>
                    </div>

                    {expandedIndex === i && entry.detections.length > 0 && (
                      <ul className="flex flex-col gap-1 border-t border-gray-700 pt-3">
                        {entry.detections.map((det, j) => (
                          <li key={j} className="flex justify-between text-xs text-gray-300">
                            <span>{det.class}</span>
                            <span className={det.confidence > 0.7 ? 'text-green-400' : 'text-yellow-400'}>
                              {(det.confidence * 100).toFixed(0)}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="text-gray-600 text-xs text-right">
                      {expandedIndex === i ? t.collapse : t.expand}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Modal del Manual de Usuario */}
            {isManualOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
                  {/* Cabecera del Modal */}
                  <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      {t.userGuideTitle}
                    </h2>
                    <button 
                      onClick={() => setIsManualOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Contenido scrolleable */}
                  <div className="p-6 overflow-y-auto flex flex-col gap-6 text-gray-300">
                    
                    <section>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <img src="/chatbot.svg" alt="Mini" className="w-5 h-5 rounded-full" />
                        {t.guideMiniTitle}
                      </h3>
                      <p className="text-sm leading-relaxed mb-3">
                        {t.guideMiniIntro1}<strong>{t.guideMiniIntroBold}</strong>{t.guideMiniIntro2}
                      </p>
                      <ul className="list-disc pl-5 text-sm space-y-2 text-gray-400">
                        <li><strong>{t.guideMiniVisualBold}</strong>{t.guideMiniVisualText}</li>
                        <li><strong>{t.guideMiniVoiceBold}</strong>{t.guideMiniVoiceText}</li>
                        <li><strong>{t.guideMiniConvBold}</strong>{t.guideMiniConvText}</li>
                      </ul>
                    </section>

                    <div className="w-full h-px bg-gray-800" />

                    <section>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <ImageIcon size={18} className="text-blue-400" />
                        <Camera size={18} className="text-purple-400" />
                        {t.guideClassicTitle}
                      </h3>
                      <p className="text-sm leading-relaxed mb-3">
                        {t.guideClassicIntro}
                      </p>
                      <ul className="list-disc pl-5 text-sm space-y-2 text-gray-400">
                        <li><strong>{t.guideClassicImageBold}</strong>{t.guideClassicImageText}</li>
                        <li><strong>{t.guideClassicWebcamBold}</strong>{t.guideClassicWebcamText}</li>
                      </ul>
                    </section>

                    <div className="w-full h-px bg-gray-800" />

                    <section>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Keyboard size={18} className="text-black-300" />
                        {t.guideShortcutsTitle}
                      </h3>
                      <ul className="text-sm space-y-2 text-gray-400">
                        <li><kbd className="bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">Enter</kbd> : {t.guideShortcutEnter}</li>
                        <li><kbd className="bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">Shift</kbd> + <kbd className="bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-700">Enter</kbd> : {t.guideShortcutShiftEnter}</li>
                      </ul>
                    </section>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App