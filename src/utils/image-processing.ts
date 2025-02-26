
export const preprocessImage = (canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.toDataURL()

  // Get original image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Calculate image statistics
  let totalBrightness = 0
  let minBrightness = 255
  let maxBrightness = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) // Standard luminance formula
    totalBrightness += brightness
    minBrightness = Math.min(minBrightness, brightness)
    maxBrightness = Math.max(maxBrightness, brightness)
  }

  const averageBrightness = totalBrightness / (data.length / 4)
  const dynamicRange = maxBrightness - minBrightness

  // Adjust contrast and brightness based on image statistics
  const contrastFactor = dynamicRange < 128 ? 2.0 : 1.5 // More aggressive contrast for low dynamic range
  const brightnessFactor = averageBrightness < 128 ? 30 : -30 // Adjust brightness based on average

  // Apply adaptive contrast enhancement
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const pixel = data[i + j]
      // Normalize pixel value
      let normalized = (pixel - 128) * contrastFactor + 128 + brightnessFactor
      // Ensure value stays within bounds
      data[i + j] = Math.max(0, Math.min(255, normalized))
    }
  }

  // Apply adaptive thresholding
  const blockSize = 15 // Size of local neighborhood
  const C = 5 // Constant subtracted from mean
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      let sum = 0
      let count = 0
      
      // Calculate local mean
      for (let dy = -blockSize; dy <= blockSize; dy++) {
        for (let dx = -blockSize; dx <= blockSize; dx++) {
          const ny = y + dy
          const nx = x + dx
          if (ny >= 0 && ny < canvas.height && nx >= 0 && nx < canvas.width) {
            const idx = (ny * canvas.width + nx) * 4
            sum += data[idx]
            count++
          }
        }
      }
      
      const mean = sum / count
      const idx = (y * canvas.width + x) * 4
      const threshold = mean - C
      
      // Apply threshold
      const value = data[idx] < threshold ? 0 : 255
      data[idx] = value
      data[idx + 1] = value
      data[idx + 2] = value
    }
  }

  // Put processed image data back to canvas
  ctx.putImageData(imageData, 0, 0)

  // Apply sharpening
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  if (tempCtx) {
    tempCtx.putImageData(imageData, 0, 0)
    ctx.filter = 'contrast(150%) brightness(110%) sharpen(1)'
    ctx.drawImage(tempCanvas, 0, 0)
  }

  // Return high-quality PNG for better OCR results
  return canvas.toDataURL('image/png', 1.0)
}
