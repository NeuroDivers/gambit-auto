
export const validateVIN = (vin: string): boolean => {
  if (vin.length !== 17) return false;

  // First normalize common OCR mistakes
  const normalizedVin = vin.toUpperCase()
    .replace(/[OoQq]/g, '0')   // O/o/Q/q → 0
    .replace(/[IiLl]/g, '1')   // I/i/L/l → 1
    .replace(/[Ss]/g, '5')     // S/s → 5
    .replace(/[Zz]/g, '2')     // Z/z → 2
    .replace(/[Bb]/g, '8')     // B/b → 8
    .replace(/[Gg]/g, '6')     // G/g → 6

  const validVINPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!validVINPattern.test(normalizedVin)) return false;

  const suspiciousPatterns = [
    /[0]{3,}/,    // Too many zeros in a row
    /[1]{3,}/,    // Too many ones in a row
    /(.)\1{4,}/,  // Any character repeated more than 4 times
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(normalizedVin));
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
