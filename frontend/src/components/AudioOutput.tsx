import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { API_URL } from '../config'
import { useLanguage } from '../context/LanguageContext'
import { useVolume } from '../context/VolumeContext'

interface Props {
  text: string
}

let currentAudio: HTMLAudioElement | null = null
let currentStop: (() => void) | null = null

export function AudioOutput({ text }: Props) {
  const { language, t } = useLanguage()
  const { volume } = useVolume()
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sincroniza el volumen en tiempo real si se mueve el slider mientras Mini habla
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        if (currentAudio === audioRef.current) {
          currentAudio = null
          currentStop = null
        }
      }
    }
  }, [])

  const stopThis = () => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.currentTime = 0
    setPlaying(false)
  }

  const speak = async () => {
    if (playing && audioRef.current) {
      stopThis()
      currentAudio = null
      currentStop = null
      return
    }

    if (loading) return

    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      currentStop?.()
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('text', text)
      formData.append('language', language)

      const response = await fetch(`${API_URL}/api/tts/synthesize`, {
        method: 'POST',
        body: formData
      })

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const newAudio = new Audio(url)
      newAudio.volume = volume
      audioRef.current = newAudio
      currentAudio = newAudio
      currentStop = () => setPlaying(false)

      newAudio.onended = () => {
        setPlaying(false)
        URL.revokeObjectURL(url)
        if (currentAudio === newAudio) {
          currentAudio = null
          currentStop = null
        }
      }

      setPlaying(true)
      newAudio.play()
    } catch {
      console.error('Error sintetizando voz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={speak}
      title={playing ? t.pauseAudio : t.playAudio}
      className={`audio-speaker-btn w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
        playing
          ? 'bg-purple-600 hover:bg-purple-700 text-white border border-gray-700'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-700'
      }`}
    >
      {playing ? (
        <VolumeX size={16} />
      ) : (
        <Volume2 size={16} />
      )}
    </button>
  )
}