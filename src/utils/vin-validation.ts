
// VIN position weights for checksum calculation
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

// VIN character values for checksum calculation
const VIN_VALUES: { [key: string]: number } = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
  'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
};

// North American manufacturer codes
const NORTH_AMERICAN_CODES = ['1', '2', '3', '4', '5'];

const calculateVinChecksum = (vin: string): string => {
  let sum = 0;
  for (let i = 0; i < vin.length; i++) {
    const char = vin.charAt(i);
    const value = VIN_VALUES[char];
    if (value === undefined) return '';
    sum += value * VIN_WEIGHTS[i];
  }
  const remainder = sum % 11;
  return remainder === 10 ? 'X' : remainder.toString();
}

export const validateVIN = (vin: string): boolean => {
  // Basic length check
  if (vin.length !== 17) return false;

  // Character validation
  const validVINPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!validVINPattern.test(vin)) return false;

  // Check for invalid characters (I, O, Q)
  if (/[IOQ]/.test(vin)) return false;

  // Check if first character is valid for North America (prioritized)
  const firstChar = vin.charAt(0);
  const isNorthAmerican = NORTH_AMERICAN_CODES.includes(firstChar);

  // Validate checksum (9th position)
  const checksumChar = vin.charAt(8);
  const calculatedChecksum = calculateVinChecksum(vin);
  if (calculatedChecksum === '') return false;
  if (checksumChar !== calculatedChecksum) return false;

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(.)\1{4,}/i,  // Same character repeated more than 4 times
    /[0-9]{17}/,   // All numbers (unlikely for a real VIN)
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(vin))) {
    return false;
  }

  // Give higher confidence to North American VINs
  return true;
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
    const countryResult = results.find((r: any) => r.Variable === 'Plant Country' && r.Value && r.Value !== 'null')

    // Give higher priority to North American vehicles
    const isNorthAmerican = countryResult?.Value === 'UNITED STATES' || 
                           countryResult?.Value === 'CANADA' || 
                           countryResult?.Value === 'MEXICO';

    return !!(makeResult && modelResult && yearResult && (isNorthAmerican || NORTH_AMERICAN_CODES.includes(vin[0])));
  } catch (error) {
    return false
  }
}

