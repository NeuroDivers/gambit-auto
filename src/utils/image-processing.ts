
export const preprocessImage = (canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.toDataURL()

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  let totalBrightness = 0
  let minBrightness = 255
  let maxBrightness = 0

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

  const shouldInvert = averageBrightness > 200 && contrast < 100
  if (shouldInvert) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]
      data[i + 1] = 255 - data[i + 1]
      data[i + 2] = 255 - data[i + 2]
    }
  }

  const contrastFactor = 1.2
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const value = data[i + j]
      const normalized = (value / 255 - 0.5) * contrastFactor + 0.5
      data[i + j] = Math.max(0, Math.min(255, Math.round(normalized * 255)))
    }
  }

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  if (tempCtx) {
    tempCtx.putImageData(imageData, 0, 0)
    ctx.filter = 'contrast(120%) brightness(105%)'
    ctx.drawImage(tempCanvas, 0, 0)
  }

  return canvas.toDataURL()
}
