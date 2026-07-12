import { useState } from 'react'
import axios from 'axios'
import { OverlayCanvas } from './components/OverlayCanvas'

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

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      const response = await axios.post<AnalyzeResponse>(
        `${API_URL}/api/analyze`,
        formData
      )
      setResult(response.data)
    } catch (err) {
      setError('Error al conectar con el backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-12">

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Asistente Visual
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Sube una imagen y pregunta lo que quieras
        </p>
      </div>

      {/* Card principal */}
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col gap-6">

        {/* Upload */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-8 cursor-pointer hover:border-purple-500 transition-colors">
          <span className="text-4xl mb-2">📁</span>
          <span className="text-gray-400">
            {image ? image.name : 'Haz clic para subir una imagen'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {/* Preview o Canvas */}
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

        {/* Input query */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="¿Qué quieres saber sobre la imagen?"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
        />

        {/* Botón */}
        <button
          onClick={handleSubmit}
          disabled={!image || !query || loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Analizando...' : 'Analizar imagen'}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-center">{error}</p>
        )}

        {/* Resultado */}
        {result && (
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-purple-400 font-semibold mb-1">Respuesta</h3>
              <p className="text-gray-200">{result.answer}</p>
            </div>
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Detecciones</h3>
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App