import { useEffect, useRef } from 'react'

interface Detection {
  class: string
  confidence: number
  bbox: number[]
}

interface Props {
  imageUrl: string
  detections: Detection[]
  action?: string | null
}

export function OverlayCanvas({ imageUrl, detections, action }: Props) {
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

        if (action === 'POINT_TO') {
          // Lógica de la flecha
          const centerX = x1 + w / 2
          const centerY = y1 + h / 2
          
          // La flecha empieza más arriba y apunta al centro
          const startX = centerX
          const startY = Math.max(labelHeight + 10, centerY - 120 * scale) 
          const endX = centerX
          const endY = centerY - 15 * scale 

          // Estilo Morado Mini
          ctx.strokeStyle = '#A855F7'
          ctx.lineWidth = lineWidth * 2
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          // Dibujar el palo de la flecha
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()

          // Dibujar la punta
          const headLength = 20 * scale
          const angle = Math.atan2(endY - startY, endX - startX)
          ctx.beginPath()
          ctx.moveTo(endX, endY)
          ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6))
          ctx.moveTo(endX, endY)
          ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6))
          ctx.stroke()

          // Texto flotante tipo "¡Aquí! (Objeto)"
          const label = `¡Aquí! (${det.class})`
          ctx.font = `bold ${fontSize}px Arial`
          const textWidth = ctx.measureText(label).width

          ctx.fillStyle = '#A855F7'
          ctx.fillRect(centerX - textWidth / 2 - labelPaddingH, startY - labelHeight - 5, textWidth + labelPaddingH * 2, labelHeight)
          ctx.fillStyle = '#FFFFFF'
          ctx.fillText(label, centerX - textWidth / 2, startY - labelHeight * 0.25 - 5)

        } else {
          // Lógica canvas caja verde
          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = lineWidth
          ctx.strokeRect(x1, y1, w, h)

          const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`
          ctx.font = `${fontSize}px Arial`
          const textWidth = ctx.measureText(label).width

          ctx.fillStyle = '#00ff00'
          ctx.fillRect(x1, y1 - labelHeight, textWidth + labelPaddingH * 2, labelHeight)
          ctx.fillStyle = '#000000'
          ctx.fillText(label, x1 + labelPaddingH, y1 - labelHeight * 0.25)
        }
      })
    }
  }, [imageUrl, detections, action])

  return (
    <canvas
      ref={canvasRef}
      style={{ maxWidth: '100%', marginBottom: '1rem' }}
    />
  )
}