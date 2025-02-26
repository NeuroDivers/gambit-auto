export const preprocessImage = (canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.toDataURL()

  // Get original image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Create temporary canvas for processing
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return canvas.toDataURL()

  // Convert to grayscale and apply initial contrast enhancement
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Convert to grayscale using luminance formula
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    data[i] = data[i + 1] = data[i + 2] = gray
  }

  // Apply Gaussian blur to reduce noise
  const sigma = 1.5
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1
  const kernel = createGaussianKernel(kernelSize, sigma)
  
  const blurredData = applyConvolution(data, canvas.width, canvas.height, kernel)
  for (let i = 0; i < data.length; i++) {
    data[i] = blurredData[i]
  }

  // Apply adaptive thresholding
  const blockSize = 25
  const C = 7
  applyAdaptiveThreshold(data, canvas.width, canvas.height, blockSize, C)

  // Apply morphological operations
  const morphKernelSize = 3
  dilate(data, canvas.width, canvas.height, morphKernelSize)
  erode(data, canvas.width, canvas.height, morphKernelSize)

  // Put processed data back to canvas
  ctx.putImageData(imageData, 0, 0)

  // Return high-quality PNG
  return canvas.toDataURL('image/png', 1.0)
}

// Create Gaussian kernel for blur operation
function createGaussianKernel(size: number, sigma: number): number[] {
  const kernel = new Array(size * size)
  const center = Math.floor(size / 2)
  let sum = 0

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center
      const dy = y - center
      const g = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma))
      kernel[y * size + x] = g
      sum += g
    }
  }

  // Normalize kernel
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= sum
  }

  return kernel
}

// Apply convolution with given kernel
function applyConvolution(data: Uint8ClampedArray, width: number, height: number, kernel: number[]): Uint8ClampedArray {
  const kernelSize = Math.sqrt(kernel.length)
  const halfKernel = Math.floor(kernelSize / 2)
  const result = new Uint8ClampedArray(data.length)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) { // Process RGB channels
        let sum = 0
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = Math.min(Math.max(x + kx - halfKernel, 0), width - 1)
            const py = Math.min(Math.max(y + ky - halfKernel, 0), height - 1)
            const kernel_val = kernel[ky * kernelSize + kx]
            sum += data[(py * width + px) * 4 + c] * kernel_val
          }
        }
        result[(y * width + x) * 4 + c] = sum
      }
      result[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3] // Preserve alpha
    }
  }

  return result
}

// Apply adaptive thresholding
function applyAdaptiveThreshold(data: Uint8ClampedArray, width: number, height: number, blockSize: number, C: number) {
  const halfBlock = Math.floor(blockSize / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      let count = 0

      // Calculate local mean
      for (let dy = -halfBlock; dy <= halfBlock; dy++) {
        for (let dx = -halfBlock; dx <= halfBlock; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            sum += data[(ny * width + nx) * 4]
            count++
          }
        }
      }

      const mean = sum / count
      const idx = (y * width + x) * 4
      const value = data[idx] < (mean - C) ? 0 : 255
      data[idx] = data[idx + 1] = data[idx + 2] = value
    }
  }
}

// Morphological dilation
function dilate(data: Uint8ClampedArray, width: number, height: number, kernelSize: number) {
  const result = new Uint8ClampedArray(data.length)
  const halfKernel = Math.floor(kernelSize / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxVal = 0
      for (let dy = -halfKernel; dy <= halfKernel; dy++) {
        for (let dx = -halfKernel; dx <= halfKernel; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            maxVal = Math.max(maxVal, data[(ny * width + nx) * 4])
          }
        }
      }
      const idx = (y * width + x) * 4
      result[idx] = result[idx + 1] = result[idx + 2] = maxVal
      result[idx + 3] = data[idx + 3]
    }
  }

  for (let i = 0; i < data.length; i++) {
    data[i] = result[i]
  }
}

// Morphological erosion
function erode(data: Uint8ClampedArray, width: number, height: number, kernelSize: number) {
  const result = new Uint8ClampedArray(data.length)
  const halfKernel = Math.floor(kernelSize / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minVal = 255
      for (let dy = -halfKernel; dy <= halfKernel; dy++) {
        for (let dx = -halfKernel; dx <= halfKernel; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            minVal = Math.min(minVal, data[(ny * width + nx) * 4])
          }
        }
      }
      const idx = (y * width + x) * 4
      result[idx] = result[idx + 1] = result[idx + 2] = minVal
      result[idx + 3] = data[idx + 3]
    }
  }

  for (let i = 0; i < data.length; i++) {
    data[i] = result[i]
  }
}

export const postProcessVIN = (text: string): string => {
  // Common OCR mistakes and their corrections
  const commonMistakes: { [key: string]: string } = {
    'O': '0',
    'Q': '0',
    'D': '0',
    'I': '1',
    'L': '1',
    'Z': '2',
    'S': '5',
    'B': '8',
    'G': '6'
  }

  // Remove common noise characters and spaces
  let processed = text.replace(/[^A-HJ-NPR-Z0-9]/g, '')

  // Apply character substitutions
  const original = processed
  processed = processed.split('').map(char => commonMistakes[char] || char).join('')

  // Validate the result meets VIN format
  const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/
  if (!vinPattern.test(processed) && vinPattern.test(original)) {
    // If substitutions made the result invalid but original was valid, keep original
    return original
  }

  return processed.toUpperCase()
}

export const cropToVinRegion = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Define VIN region with reduced padding
  const vinRegionHeight = canvas.height * 0.15 // 15% of image height
  const vinRegionWidth = canvas.width * 0.7 // 70% of image width
  const startX = (canvas.width - vinRegionWidth) / 2
  const startY = (canvas.height - vinRegionHeight) / 2

  // Create new canvas with cropped dimensions
  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = vinRegionWidth
  croppedCanvas.height = vinRegionHeight

  // Draw cropped region to new canvas
  const croppedCtx = croppedCanvas.getContext('2d')
  if (croppedCtx) {
    croppedCtx.drawImage(
      canvas,
      startX, startY, vinRegionWidth, vinRegionHeight,
      0, 0, vinRegionWidth, vinRegionHeight
    )
  }

  return croppedCanvas
}
