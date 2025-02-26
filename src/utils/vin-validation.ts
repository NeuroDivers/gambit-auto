
export const validateVIN = (vin: string): boolean => {
  if (vin.length !== 17) return false;

  const validVINPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!validVINPattern.test(vin)) return false;

  const suspiciousPatterns = [
    /[O0]{3,}/i,  // Too many zeros or O's in a row
    /[1I]{3,}/i,  // Too many ones or I's in a row
    /(.)\1{4,}/i, // Any character repeated more than 4 times
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(vin));
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
