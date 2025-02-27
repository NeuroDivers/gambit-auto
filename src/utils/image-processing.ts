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
    autoInvertLight = true,
    autoInvertDark = false,
    edgeEnhancement = true,
    noiseReduction = true,
    adaptiveContrast = true
  } = settings

  // Calculate average brightness
  let totalBrightness = 0
  for (let i = 0; i < data.length; i += 4) {
    totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
  }
  const avgBrightness = totalBrightness / (data.length / 4)
  
  // Determine if we should invert based on settings and brightness
  const shouldInvert = (
    (autoInvertLight && avgBrightness < 128) || // Light text on dark background
    (autoInvertDark && avgBrightness >= 128)    // Dark text on light background
  )

  if (shouldInvert) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]         // Invert red
      data[i + 1] = 255 - data[i + 1] // Invert green
      data[i + 2] = 255 - data[i + 2] // Invert blue
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
        // Enhanced blue channel isolation with reduced artifacts for first character
        const x = Math.floor((i / 4) % canvas.width)
        const isFirstCharRegion = x < canvas.width * 0.15 // First 15% of width
        if (isFirstCharRegion) {
          // Use more balanced weights for the first character region
          gray = (r * 0.3 + g * 0.3 + b * 0.4)
        } else {
          // Enhanced blue channel isolation with red/green suppression for rest
          gray = Math.max(b - ((r + g) / 3), 0)
        }
        break
      case 'luminosity':
      default:
        const weights = (() => {
          switch (blueEmphasis) {
            case 'very-high': return { r: 0.1, g: 0.1, b: 0.8 }
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
          case 'very-high': return { dark: 0.2, light: 2.0 }
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
  // Define valid country and manufacturer codes
  const countryCodeMap: { [key: string]: string } = {
    '1': 'USA',
    '4': 'USA',
    '5': 'USA',
    '2': 'Canada',
    '3': 'Mexico',
    'J': 'Japan',
    'K': 'South Korea',
    'W': 'Germany',
    'V': 'France/Spain',
    'S': 'UK',
    'Z': 'Italy',
    'Y': 'Sweden/Finland',
    'L': 'China',
    '9': 'Brazil'
  }

  const manufacturerCodeMap: { [key: string]: string[] } = {
    'A': ['Audi', 'Jaguar'],
    'B': ['BMW', 'Dodge'],
    'C': ['Chrysler'],
    'F': ['Ford'],
    'G': ['General Motors', 'Chevrolet'],
    'H': ['Honda', 'Hyundai'],
    'J': ['Jeep'],
    'L': ['Lincoln'],
    'M': ['Mazda', 'Mercedes-Benz'],
    'N': ['Nissan'],
    'T': ['Toyota'],
    'V': ['Volvo', 'Volkswagen']
  }

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

  // Special case: If string starts with 'R1G1', it's likely '1G1' (GM vehicles)
  if (processed.startsWith('R1G1')) {
    console.log('Detected R1G1 pattern, correcting to 1G1 (GM vehicle)')
    processed = '1G1' + processed.slice(4)
  }

  // If first character isn't a valid country code but looks like a common misread
  if (processed.length > 0 && !countryCodeMap[processed[0]]) {
    const firstChar = processed[0]
    console.log(`Invalid country code detected: ${firstChar}`)
    
    // Common misreads for country codes
    if (firstChar === 'R' || firstChar === 'I') {
      console.log('Correcting first character to 1 (USA)')
      processed = '1' + processed.slice(1)
    } else if (firstChar === 'O') {
      console.log('Correcting first character to 0')
      processed = '0' + processed.slice(1)
    }
  }

  // Special handling for second character (manufacturer)
  if (processed.length > 1) {
    const manufacturerChar = processed[1]
    if (!manufacturerCodeMap[manufacturerChar]) {
      console.log(`Potential invalid manufacturer code: ${manufacturerChar}`)
      
      // If second character is a number, try to determine the correct manufacturer
      if (/[0-9]/.test(manufacturerChar)) {
        // If it starts with 1 and second char is number, likely GM (G)
        if (processed[0] === '1') {
          console.log('Correcting numeric manufacturer code to G (General Motors)')
          processed = processed[0] + 'G' + processed.slice(2)
        }
        // Add more manufacturer corrections based on patterns if needed
      }
    }
  }

  // Special handling for common GM VIN patterns
  if (processed.length >= 3) {
    const wmi = processed.slice(0, 3)
    if (/^[1-5][0-9]1/.test(wmi)) {
      // If WMI looks like "161", "151", etc., it's likely "1G1"
      console.log(`Correcting invalid WMI ${wmi} to 1G1 (GM pattern)`)
      processed = '1G1' + processed.slice(3)
    }
  }

  // Apply character substitutions for the rest of the VIN
  processed = processed.split('').map((char, index) => {
    // Don't apply general substitutions to first two characters
    if (index < 2) return char
    return commonMistakes[char] || char
  }).join('')

  // Enhanced VIN validation
  const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/
  const naVinPattern = /^[1-5][A-HJ-NPR-Z0-9]{16}$/ // North American VIN pattern
  const manufacturerPattern = /^[1-9][A-Z][A-Z0-9]{15}$/ // Ensures second char is letter

  // Log validation information
  if (processed.length === 17) {
    const country = countryCodeMap[processed[0]] || 'Unknown'
    const manufacturers = manufacturerCodeMap[processed[1]] || ['Unknown']
    console.log(`Detected: Country - ${country}, Possible Manufacturers - ${manufacturers.join(' or ')}`)
  }

  // Check if the processed result matches VIN patterns
  const isProcessedValid = vinPattern.test(processed) && manufacturerPattern.test(processed)
  const isProcessedNA = naVinPattern.test(processed) && manufacturerPattern.test(processed)
  const isOriginalValid = vinPattern.test(original) && manufacturerPattern.test(original)
  const isOriginalNA = naVinPattern.test(original) && manufacturerPattern.test(original)

  // Prefer North American VINs if detected
  if (isProcessedNA) return processed
  if (isOriginalNA) return original

  // Fall back to general VIN format
  if (isProcessedValid) return processed
  if (isOriginalValid) return original

  // If no valid VIN is found, return the cleaned original text
  return original.toUpperCase()
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

export const cropToVinRegion = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Match the overlay dimensions exactly
  const vinRegionWidth = canvas.width * 0.95 // 95% of width to match UI
  const vinRegionHeight = canvas.height * (40/canvas.height) // Fixed 40px height to match UI
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
