import { applyConvolution, createGaussianKernel, applyUnsharpMask, applyMedianFilter, calculateOtsuThreshold } from './convolution';
import { dilate, erode } from './morphological';
import { getLocalArea, getLocalContrast } from './local-analysis';
import { applyAdaptiveThreshold } from './thresholding';

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
            case 'zero': return { r: 0.33, g: 0.33, b: 0.33 }  // No blue emphasis
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
