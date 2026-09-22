import { useState, useRef } from 'react'
import { Mic, Square } from 'lucide-react'
import { API_URL } from '../config'
import { useLanguage } from '../context/LanguageContext'
import axios from 'axios'

interface Props {
  onTranscription: (text: string) => void
  onLoadingChange: (loading: boolean) => void
  onRecordingChange?: (recording: boolean) => void
  showHint?: boolean
}

export function AudioInput({ onTranscription, onLoadingChange, onRecordingChange, showHint = true }: Props) {
  const { language, t } = useLanguage()
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
      onRecordingChange?.(true)
    } catch {
      console.error('No se pudo acceder al micrófono')
    }
  }

  const stopAudio = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    onRecordingChange?.(false)
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
      formData.append('language', language)

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
    <div className="relative flex flex-col items-center">
      <button
        onClick={recording ? stopAudio : startAudio}
        disabled={loading}
        title={recording ? t.stopAudio : t.startAudio}
        className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all flex-shrink-0 border ${
          recording
            ? 'bg-red-500 hover:bg-red-600 border-transparent text-white animate-pulse'
            : loading
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-700 text-gray-500 dark:text-gray-400 transition-colors opacity-50 cursor-not-allowed'
            : 'bg-gray-100 dark:bg-gray-800 border-gray-700 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {recording ? (
          <Square size={18} fill="currentColor" className="text-white" />
        ) : (
          <Mic size={18} className={loading ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300 transition-colors'} />
        )}
      </button>
      {showHint && recording && (
        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-red-500 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-500/30 rounded-full px-3 py-1 shadow-lg animate-pulse z-10 transition-colors">
          {t.tapToStopRecording}
        </span>
      )}
    </div>
  )
}