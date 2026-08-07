import { useState } from 'react'
import axios from 'axios'
import { Navbar } from './components/Navbar'
import { OverlayCanvas } from './components/OverlayCanvas'
import { useLanguage } from './context/LanguageContext'
import { WebcamCapture } from './components/WebcamCapture'
import { Image as ImageIcon, Camera, Search, FolderOpen, Trash2 } from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000'

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
  const [mode, setMode] = useState<'image' | 'webcam'>('image')

  const { language, t } = useLanguage()

  const handleModeChange = (newMode: 'image' | 'webcam') => {
    setMode(newMode)
    setResult(null) // Limpiamos el resultado anterior para evitar el "hueco"
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
    }
  }

  const handleSubmit = async () => {
    if (!image || !query) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('query', query)
      formData.append('language', language)

      const response = await axios.post<AnalyzeResponse>(
        `${API_URL}/api/analyze`,
        formData
      )
      setResult(response.data)

      setHistory(prev => [{
        query,
        answer: response.data.answer,
        preview,
        detections: response.data.detections
      }, ...prev])

      setQuery('')
      
    } catch (err) {
      console.error(err)
      setError('Error al conectar con el backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-12">

      <Navbar />

      <div className="flex flex-col items-center px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* Layout — card centrada + historial fijo a la derecha */}
        <div className="w-full max-w-6xl flex justify-center relative">

          {/* Card principal centrada */}
          <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col gap-6">

            {/* Selector de modo */}
            <div className="flex rounded-xl overflow-hidden border border-gray-700">
              <button
                onClick={() => handleModeChange('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-all ${
                  mode === 'image'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <ImageIcon size={18} />
                <span>{t.imageMode}</span>
              </button>

              <button
                onClick={() => handleModeChange('webcam')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-all ${
                  mode === 'webcam'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Camera size={18} />
                <span>{t.webcamMode}</span>
              </button>
            </div>

            {mode === 'image' ? (
              <>
                {/* Upload */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-8 cursor-pointer hover:border-purple-500 transition-colors">
                  <div className="mb-2 text-gray-400">
                    <FolderOpen size={48} strokeWidth={1.5} />
                  </div>
                  {image ? (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-purple-400 font-medium">{image.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault() // Evita que se abra el selector de archivos de nuevo
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

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={t.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />

                <button
                  onClick={handleSubmit}
                  disabled={!image || !query || loading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? t.analyzing : t.analyze}
                </button>

                {error && <p className="text-red-400 text-center">{t.error}</p>}

                {result && (
                  <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
                    <div>
                      <h3 className="text-purple-400 font-semibold mb-1">{t.response}</h3>
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
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />

                <WebcamCapture
                  query={query}
                  onResult={(r) => {
                    setResult(r)
                    if (query) {
                      setHistory(prev => [{
                        query,
                        answer: r.answer,
                        preview: '',
                        detections: r.detections
                      }, ...prev])
                    }
                  }}
                />

                {result && mode === 'webcam' && (
                  <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
                    <div>
                      <h3 className="text-purple-400 font-semibold mb-1">{t.response}</h3>
                      <p className="text-gray-200">{result.answer}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Historial fijo a la derecha sin afectar el centro */}
          <div className="absolute left-full ml-6 w-72 flex flex-col gap-4 top-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-300">{t.history}</h2>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
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
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                          <Camera size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <div className="text-purple-400 text-sm font-semibold truncate flex items-center gap-2">
                          <Search size={14} className="flex-shrink-0" />
                          <span className="truncate">{entry.query}</span>
                        </div>
                        <div className={`text-gray-300 text-xs ${expandedIndex === i ? '' : 'line-clamp-3'}`}>
                          {entry.answer}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {entry.detections.length > 0
                            ? t.detectedObjects(entry.detections.length)
                            : t.noDetections}
                        </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default App