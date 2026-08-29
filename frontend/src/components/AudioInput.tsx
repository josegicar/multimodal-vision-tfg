import { useState, useRef } from 'react'
import { Mic, Square } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

interface Props {
  onTranscription: (text: string) => void
  onLoadingChange: (loading: boolean) => void
}

export function AudioInput({ onTranscription, onLoadingChange }: Props) {
  const { t } = useLanguage()
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        await sendAudio(blob)
      }

      mediaRecorder.start()
      setRecording(true)
    } catch {
      console.error('No se pudo acceder al micrófono')
    }
  }

  const stopAudio = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const setLoadingState = (val: boolean) => {
    setLoading(val)
    onLoadingChange(val)
    }

  const sendAudio = async (blob: Blob) => {
    setLoadingState(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

      const response = await axios.post<{ text: string; language: string }>(
        `${API_URL}/api/stt/transcribe`,
        formData
      )

      if (response.data.text) {
        onTranscription(response.data.text)
      }
    } catch {
      console.error('Error transcribiendo audio')
    } finally {
      setLoadingState(false)
    }
  }

  return (
    <button
      onClick={recording ? stopAudio : startAudio}
      disabled={loading}
      title={recording ? t.stopAudio : t.startAudio}
      className={`p-3 rounded-xl transition-all flex-shrink-0 ${
        recording
          ? 'bg-red-600 hover:bg-red-700 animate-pulse'
          : loading
          ? 'bg-gray-700 opacity-50 cursor-not-allowed'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      {recording ? (
        <Square size={18} fill="currentColor" className="text-white" />
      ) : (
        <Mic size={18} className={loading ? 'text-gray-400' : 'text-white'} />
      )}
    </button>
  )
}