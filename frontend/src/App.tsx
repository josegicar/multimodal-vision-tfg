import { useState } from 'react'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

interface AnalyzeResponse {
  answer: string
  detections: {
    class: string
    confidence: number
    bbox: number[]
  }[]
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
    } catch {
      setError('Error al conectar con el backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Asistente Visual</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{ maxWidth: '100%', marginBottom: '1rem' }}
        />
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué quieres saber sobre la imagen?"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!image || !query || loading}
        style={{ padding: '0.5rem 1rem' }}
      >
        {loading ? 'Analizando...' : 'Analizar'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Respuesta:</h3>
          <p>{result.answer}</p>

          <h3>Detecciones:</h3>
          <ul>
            {result.detections.map((det, i) => (
              <li key={i}>
                {det.class} — confianza: {(det.confidence * 100).toFixed(0)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default App