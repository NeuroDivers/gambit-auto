
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
  const contrast = maxBrightness - minBrightness

  // Adaptive thresholding
  const threshold = averageBrightness * 0.9
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
    
    // Convert to black and white with adaptive threshold
    const value = brightness > threshold ? 255 : 0
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
  }

  // Apply sharpening
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  if (tempCtx) {
    tempCtx.putImageData(imageData, 0, 0)
    ctx.filter = 'contrast(150%) brightness(110%) saturate(0%) sharpen(1)'
    ctx.drawImage(tempCanvas, 0, 0)
  }

  return canvas.toDataURL('image/png', 1.0)
}
