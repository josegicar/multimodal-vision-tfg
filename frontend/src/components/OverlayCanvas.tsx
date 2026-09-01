import { useEffect, useRef } from 'react'

interface Detection {
  class: string
  confidence: number
  bbox: number[]
}

interface Props {
  imageUrl: string
  detections: Detection[]
}

export function OverlayCanvas({ imageUrl, detections }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(new Image())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = imgRef.current
    img.src = imageUrl
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)

      const scale = img.width / 1000
      const fontSize = Math.max(16, 22 * scale)
      const lineWidth = Math.max(2, 3 * scale)
      const labelPaddingH = 8 * scale
      const labelHeight = fontSize + 10 * scale

      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox
        const w = x2 - x1
        const h = y2 - y1

        // Caja
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = lineWidth
        ctx.strokeRect(x1, y1, w, h)

        // Etiqueta
        const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`
        ctx.font = `${fontSize}px Arial`
        const textWidth = ctx.measureText(label).width

        ctx.fillStyle = '#00ff00'
        ctx.fillRect(x1, y1 - labelHeight, textWidth + labelPaddingH * 2, labelHeight)
        ctx.fillStyle = '#000000'
        ctx.fillText(label, x1 + labelPaddingH, y1 - labelHeight * 0.25)
      })
    }
  }, [imageUrl, detections])

  return (
    <canvas
      ref={canvasRef}
      style={{ maxWidth: '100%', marginBottom: '1rem' }}
    />
  )
}