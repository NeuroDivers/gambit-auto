
export const validateVIN = (vin: string): boolean => {
  if (vin.length !== 17) return false;

  // Updated pattern to explicitly exclude I, O, Q
  const validVINPattern = /^[A-HJ-MNPR-Z0-9]{17}$/;
  if (!validVINPattern.test(vin)) return false;

  const suspiciousPatterns = [
    /[0]{3,}/,      // Too many zeros in a row
    /(.)\1{4,}/,    // Any character repeated more than 4 times
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
