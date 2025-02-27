
export const preprocessImage = (canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.toDataURL()

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Get processing settings from localStorage
  const settings = JSON.parse(localStorage.getItem('scanner-settings') || '{}')
  const {
    blueEmphasis = 'very-high',
    contrast = 'very-high',
    morphKernelSize = '3',
    grayscaleMethod = 'blue-channel',
    autoInvert = true,
    autoInvertDark = false,
    edgeEnhancement = true,
    noiseReduction = true,
    adaptiveContrast = true
  } = settings

  // Auto invert if enabled
  let totalBrightness = 0
  for (let i = 0; i < data.length; i += 4) {
    totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
  }
  const avgBrightness = totalBrightness / (data.length / 4)
  
  // Determine if we should invert based on settings and brightness
  const shouldInvert = (
    (autoInvert && avgBrightness < 128) || // Light text on dark background
    (autoInvertDark && avgBrightness >= 128) // Dark text on light background
  )

  if (shouldInvert) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]
      data[i + 1] = 255 - data[i + 1]
      data[i + 2] = 255 - data[i + 2]
    }
  }

  // Apply pre-sharpen for initial edge enhancement
  if (edgeEnhancement) {
    const sharpenKernel = [
      -1, -1, -1,
      -1,  9, -1,
      -1, -1, -1
    ]
    const sharpenedData = applyConvolution(data, canvas.width, canvas.height, sharpenKernel)
    for (let i = 0; i < data.length; i++) {
      data[i] = sharpenedData[i]
    }
  }

  // Apply grayscale conversion based on selected method
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    let gray
    switch (grayscaleMethod) {
      case 'average':
        gray = (r + g + b) / 3
        break
      case 'blue-channel':
        // Enhanced blue channel isolation with red/green suppression
        gray = Math.max(b - ((r + g) / 3), 0)
        break
      case 'luminosity':
      default:
        const weights = (() => {
          switch (blueEmphasis) {
            case 'very-high': return { r: 0.1, g: 0.1, b: 0.8 }  // More extreme blue emphasis
            case 'high': return { r: 0.15, g: 0.15, b: 0.7 }
            default: return { r: 0.2, g: 0.3, b: 0.5 }
          }
        })()
        gray = weights.r * r + weights.g * g + weights.b * b
    }

    // Apply adaptive contrast if enabled
    if (adaptiveContrast) {
      const x = Math.floor((i / 4) % canvas.width)
      const y = Math.floor((i / 4) / canvas.width)
      const localArea = getLocalArea(data, x, y, canvas.width, canvas.height)
      const localContrast = getLocalContrast(localArea)
      
      const contrastValues = (() => {
        switch (contrast) {
          case 'very-high': return { dark: 0.2, light: 2.0 }  // More extreme contrast
          case 'high': return { dark: 0.3, light: 1.8 }
          default: return { dark: 0.4, light: 1.6 }
        }
      })()

      // Enhanced contrast multiplier for better local adaptation
      const contrastMultiplier = Math.max(1.2, 1.8 - localContrast)
      gray = gray < 128 ? 
        gray * (contrastValues.dark * contrastMultiplier) : 
        Math.min(255, gray * (contrastValues.light * contrastMultiplier))
    } else {
      // Enhanced regular contrast
      const contrastValues = (() => {
        switch (contrast) {
          case 'very-high': return { dark: 0.2, light: 2.0 }
          case 'high': return { dark: 0.3, light: 1.8 }
          default: return { dark: 0.4, light: 1.6 }
        }
      })()
      gray = gray < 128 ? 
        gray * contrastValues.dark : 
        Math.min(255, gray * contrastValues.light)
    }

    data[i] = data[i + 1] = data[i + 2] = gray
  }

  // Double-pass edge enhancement if enabled
  if (edgeEnhancement) {
    const blurRadius = 1
    const amount = 2.0  // Increased from 1.5
    const threshold = 5 // Reduced from 10
    applyUnsharpMask(data, canvas.width, canvas.height, blurRadius, amount, threshold)
  }

  // Apply morphological operations
  const mKernelSize = parseInt(morphKernelSize)
  // Dilate first to thicken characters
  dilate(data, canvas.width, canvas.height, mKernelSize)
  dilate(data, canvas.width, canvas.height, mKernelSize) // Second pass
  // Then erode to clean up
  erode(data, canvas.width, canvas.height, mKernelSize)

  // Apply noise reduction if enabled
  if (noiseReduction) {
    // Double pass median filter with small radius
    applyMedianFilter(data, canvas.width, canvas.height, 1)
    applyMedianFilter(data, canvas.width, canvas.height, 1)
  }

  // Final contrast adjustment to ensure black/white separation
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i]
    data[i] = data[i + 1] = data[i + 2] = value > 180 ? 255 : value < 75 ? 0 : value
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL()
}

export const postProcessVIN = (text: string): string => {
  // Enhanced character correction map
  const commonMistakes: { [key: string]: string } = {
    'O': '0',
    'Q': '0',
    'D': '0',
    'I': '1',
    'L': '1',
    'Z': '2',
    'S': '5',
    'B': '8',
    'G': '6',
    'T': '7',
    'A': '4', // Only if confidence is low
    'H': '4', // Only if confidence is low
    'U': '0', // Only if confidence is low
    'V': 'Y' // Only if in known position
  }

  // Remove all non-alphanumeric characters and spaces
  let processed = text.replace(/[^A-HJ-NPR-Z0-9]/g, '')

  // Keep original for validation
  const original = processed

  // Apply character substitutions
  processed = processed.split('').map(char => commonMistakes[char] || char).join('')

  // Enhanced VIN validation
  const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/
  const naVinPattern = /^[1-5][A-HJ-NPR-Z0-9]{16}$/ // North American VIN pattern

  // Check if the processed result matches VIN patterns
  const isProcessedValid = vinPattern.test(processed)
  const isProcessedNA = naVinPattern.test(processed)
  const isOriginalValid = vinPattern.test(original)
  const isOriginalNA = naVinPattern.test(original)

  // Prefer North American VINs if detected
  if (isProcessedNA) return processed
  if (isOriginalNA) return original

  // Fall back to general VIN format
  if (isProcessedValid) return processed
  if (isOriginalValid) return original

  // If no valid VIN is found, return the cleaned original text
  return original.toUpperCase()
}

// Enhanced cropToVinRegion with intelligent text detection
export const cropToVinRegion = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Create a copy of the canvas for processing
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return canvas
  
  // Draw the image to the temp canvas
  tempCtx.drawImage(canvas, 0, 0)
  
  // Get image data for processing
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
  const data = imageData.data
  
  // Convert to grayscale for text detection
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    data[i] = data[i + 1] = data[i + 2] = avg
  }
  
  // Apply binary threshold for better text isolation
  const threshold = calculateOtsuThreshold(data)
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] < threshold ? 0 : 255
    data[i] = data[i + 1] = data[i + 2] = value
  }
  
  tempCtx.putImageData(imageData, 0, 0)
  
  // Try to find text regions using projection profiles
  const { startX, startY, width, height } = findTextRegion(data, tempCanvas.width, tempCanvas.height)
  
  // If we couldn't find a text region, use a default region (centered region)
  let regionWidth = width > 0 ? width : tempCanvas.width * 0.95
  let regionHeight = height > 0 ? height : tempCanvas.height * 0.25
  let regionStartX = startX >= 0 ? startX : (tempCanvas.width - regionWidth) / 2
  let regionStartY = startY >= 0 ? startY : (tempCanvas.height - regionHeight) / 2
  
  // Ensure minimum height for VIN text (avoid narrow crops)
  const minHeight = 30
  if (regionHeight < minHeight) {
    const diffHeight = minHeight - regionHeight
    regionStartY = Math.max(0, regionStartY - diffHeight / 2)
    regionHeight = Math.min(tempCanvas.height, regionHeight + diffHeight)
  }
  
  // Ensure minimum width for VIN text (17 characters)
  const minWidth = tempCanvas.width * 0.7
  if (regionWidth < minWidth) {
    const diffWidth = minWidth - regionWidth
    regionStartX = Math.max(0, regionStartX - diffWidth / 2)
    regionWidth = Math.min(tempCanvas.width, regionWidth + diffWidth)
  }
  
  // Add some padding
  const paddingX = tempCanvas.width * 0.05
  const paddingY = tempCanvas.height * 0.05
  
  regionStartX = Math.max(0, regionStartX - paddingX / 2)
  regionStartY = Math.max(0, regionStartY - paddingY / 2)
  regionWidth = Math.min(tempCanvas.width - regionStartX, regionWidth + paddingX)
  regionHeight = Math.min(tempCanvas.height - regionStartY, regionHeight + paddingY)
  
  // Create result canvas with the detected region
  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = regionWidth
  croppedCanvas.height = regionHeight
  
  const croppedCtx = croppedCanvas.getContext('2d')
  if (croppedCtx) {
    // Draw only the text region to the new canvas from the original (not binary) image
    croppedCtx.drawImage(
      canvas,
      regionStartX, regionStartY, regionWidth, regionHeight,
      0, 0, regionWidth, regionHeight
    )
  }
  
  return croppedCanvas
}

// Find the region containing text using horizontal and vertical projection profiles
function findTextRegion(data: Uint8ClampedArray, width: number, height: number): { 
  startX: number, 
  startY: number, 
  width: number, 
  height: number 
} {
  // Calculate horizontal and vertical projections
  const horizontalProjection = new Array(height).fill(0)
  const verticalProjection = new Array(width).fill(0)
  
  // Black pixels have value 0 in binary image - count them in each row/column
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (data[idx] === 0) { // Black pixel (text)
        horizontalProjection[y]++
        verticalProjection[x]++
      }
    }
  }
  
  // Normalize by the maximum count
  const maxHorizontal = Math.max(...horizontalProjection)
  const maxVertical = Math.max(...verticalProjection)
  
  // If no black pixels found, return negative values to use defaults
  if (maxHorizontal === 0 || maxVertical === 0) {
    return { startX: -1, startY: -1, width: -1, height: -1 }
  }
  
  // Define thresholds for text regions (% of max projection)
  const horizontalThreshold = maxHorizontal * 0.05
  const verticalThreshold = maxVertical * 0.05
  
  // Find text regions (areas with density above threshold)
  let topY = -1, bottomY = -1
  let leftX = -1, rightX = -1
  
  // Find top edge
  for (let y = 0; y < height; y++) {
    if (horizontalProjection[y] > horizontalThreshold) {
      topY = y
      break
    }
  }
  
  // Find bottom edge
  for (let y = height - 1; y >= 0; y--) {
    if (horizontalProjection[y] > horizontalThreshold) {
      bottomY = y
      break
    }
  }
  
  // Find left edge
  for (let x = 0; x < width; x++) {
    if (verticalProjection[x] > verticalThreshold) {
      leftX = x
      break
    }
  }
  
  // Find right edge
  for (let x = width - 1; x >= 0; x--) {
    if (verticalProjection[x] > verticalThreshold) {
      rightX = x
      break
    }
  }
  
  // Calculate region dimensions
  const regionWidth = rightX - leftX + 1
  const regionHeight = bottomY - topY + 1
  
  // Ensure we found valid regions
  if (topY < 0 || leftX < 0 || regionWidth <= 0 || regionHeight <= 0) {
    return { startX: -1, startY: -1, width: -1, height: -1 }
  }
  
  return { 
    startX: leftX, 
    startY: topY, 
    width: regionWidth, 
    height: regionHeight 
  }
}

// New helper functions for improved processing

function getLocalArea(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number[] {
  const area = []
  const radius = 2
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = Math.min(Math.max(x + dx, 0), width - 1)
      const ny = Math.min(Math.max(y + dy, 0), height - 1)
      const idx = (ny * width + nx) * 4
      area.push(data[idx])
    }
  }
  return area
}

function getLocalContrast(area: number[]): number {
  const min = Math.min(...area)
  const max = Math.max(...area)
  return (max - min) / 255
}

function applyUnsharpMask(data: Uint8ClampedArray, width: number, height: number, radius: number, amount: number, threshold: number) {
  const original = new Uint8ClampedArray(data)
  const blurred = new Uint8ClampedArray(data.length)
  
  // Apply Gaussian blur
  const kernel = createGaussianKernel(radius * 2 + 1, radius)
  const blurredData = applyConvolution(data, width, height, kernel)
  
  // Apply unsharp mask
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const diff = original[i + j] - blurredData[i + j]
      if (Math.abs(diff) > threshold) {
        data[i + j] = Math.min(255, Math.max(0, original[i + j] + diff * amount))
      }
    }
  }
}

function applyMedianFilter(data: Uint8ClampedArray, width: number, height: number, radius: number) {
  const temp = new Uint8ClampedArray(data)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const area = getLocalArea(temp, x, y, width, height)
      const median = area.sort((a, b) => a - b)[Math.floor(area.length / 2)]
      
      data[idx] = data[idx + 1] = data[idx + 2] = median
    }
  }
}

// Calculate Otsu's threshold
function calculateOtsuThreshold(data: Uint8ClampedArray): number {
  const histogram = new Array(256).fill(0)
  let pixelCount = 0

  // Build histogram
  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++
    pixelCount++
  }

  let sum = 0
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i]
  }

  let sumB = 0
  let wB = 0
  let wF = 0
  let maxVariance = 0
  let threshold = 0

  for (let t = 0; t < 256; t++) {
    wB += histogram[t]
    if (wB === 0) continue

    wF = pixelCount - wB
    if (wF === 0) break

    sumB += t * histogram[t]
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const variance = wB * wF * (mB - mF) * (mB - mF)

    if (variance > maxVariance) {
      maxVariance = variance
      threshold = t
    }
  }

  return threshold
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
