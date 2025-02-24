
export const preprocessImage = (canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.toDataURL()

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  let totalBrightness = 0
  let minBrightness = 255
  let maxBrightness = 0

  // Calculate brightness statistics
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
    totalBrightness += brightness
    minBrightness = Math.min(minBrightness, brightness)
    maxBrightness = Math.max(maxBrightness, brightness)
  }

  const averageBrightness = totalBrightness / (data.length / 4)

  // Increase contrast first
  const contrastFactor = 1.5
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const pixel = data[i + j]
      const normalized = (pixel / 255 - 0.5) * contrastFactor + 0.5
      data[i + j] = Math.max(0, Math.min(255, Math.round(normalized * 255)))
    }
  }

  // Apply adaptive thresholding with higher threshold for better separation
  const threshold = averageBrightness * 1.1
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
    
    // Convert to pure black and white
    const value = brightness > threshold ? 255 : 0
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
  }

  // Apply sharpening and final adjustments
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  if (tempCtx) {
    tempCtx.putImageData(imageData, 0, 0)
    ctx.filter = 'contrast(200%) brightness(120%) saturate(0%) sharpen(2)'
    ctx.drawImage(tempCanvas, 0, 0)
  }

  return canvas.toDataURL('image/png', 1.0)
}
