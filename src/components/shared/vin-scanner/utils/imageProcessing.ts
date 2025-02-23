
export const processImageForOCR = (imageData: ImageData) => {
  const data = imageData.data
  
  // Convert to grayscale and increase contrast
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    const adjusted = avg > 127 ? 255 : 0 // Binary threshold
    data[i] = adjusted     // R
    data[i + 1] = adjusted // G
    data[i + 2] = adjusted // B
  }
  
  return imageData
}

export const captureFrame = (videoRef: HTMLVideoElement, canvasRef: HTMLCanvasElement) => {
  const ctx = canvasRef.getContext('2d')
  
  if (!ctx) return null

  // Make canvas match video dimensions exactly
  canvasRef.width = videoRef.videoWidth
  canvasRef.height = videoRef.videoHeight

  // Clear previous frame
  ctx.clearRect(0, 0, canvasRef.width, canvasRef.height)
  ctx.drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height)

  // Apply image processing to improve OCR
  const imageData = ctx.getImageData(0, 0, canvasRef.width, canvasRef.height)
  const processed = processImageForOCR(imageData)
  ctx.putImageData(processed, 0, 0)
  
  return canvasRef.toDataURL('image/png', 1.0)
}
