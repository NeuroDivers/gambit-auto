export const validateVIN = (vin: string): boolean => {
  if (vin.length !== 17) return false;

  // Strict VIN pattern for modern vehicles (post-1981)
  const validVINPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!validVINPattern.test(vin)) {
    console.log('VIN failed pattern validation:', vin);
    return false;
  }

  // Common manufacturer codes for first position
  const validWMI = /^[A-HJ-NPR-Z][A-HJ-NPR-Z0-9]{2}/;
  if (!validWMI.test(vin)) {
    console.log('VIN failed WMI validation:', vin);
    return false;
  }

  // Check for sequential number format (last 6 digits)
  const sequentialNumber = /[0-9]{6}$/;
  if (!sequentialNumber.test(vin.slice(-6))) {
    console.log('VIN failed sequential number validation:', vin);
    return false;
  }

  // Remove suspicious pattern checks that might be too restrictive
  const suspiciousPatterns = [
    /[0]{3,}/,      // Too many zeros in a row
    /(.)\1{4,}/     // Any character repeated more than 4 times
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(vin))) {
    console.log('VIN failed suspicious pattern validation:', vin);
    return false;
  }

  return true;
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

export const validateVinWithNHTSA = async (vin: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
    if (!response.ok) {
      return false
    }

    const data = await response.json()
    const results = data.Results

    if (!Array.isArray(results)) {
      return false
    }

    const makeResult = results.find((r: any) => r.Variable === 'Make' && r.Value && r.Value !== 'null')
    const modelResult = results.find((r: any) => r.Variable === 'Model' && r.Value && r.Value !== 'null')
    const yearResult = results.find((r: any) => r.Variable === 'Model Year' && r.Value && r.Value !== 'null')

    return !!(makeResult && modelResult && yearResult)
  } catch (error) {
    return false
  }
}
