
export type VinPosition = {
  value: string;
  isValid: boolean;
  description: string;
}

const VALID_VIN_CHARS = {
  WMI: /[A-HJ-NPR-Z0-9]{3}/, // Characters 1-3
  RESTRAINT: /[A-HJ-NPR-Z0-9]{1}/, // Character 4
  BODY: /[A-HJ-NPR-Z0-9]{3}/, // Characters 5-7
  ENGINE: /[A-HJ-NPR-Z0-9]{1}/, // Character 8
  CHECK: /[0-9X]{1}/, // Character 9
  YEAR: /[A-HJ-NPR-Z0-9]{1}/, // Character 10
  PLANT: /[A-HJ-NPR-Z0-9]{1}/, // Character 11
  SEQUENCE: /[0-9]{6}/ // Characters 12-17
};

const MODEL_YEAR_CODES: { [key: string]: number } = {
  'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
  'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
  'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
  'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
  'Y': 2030, '1': 2001, '2': 2002, '3': 2003, '4': 2004,
  '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
};

export const validateVIN = (vin: string): boolean => {
  // Basic length and character check
  if (vin.length !== 17) return false;
  
  const validVINPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!validVINPattern.test(vin)) return false;

  // Check each section according to its specific rules
  const sections = {
    wmi: vin.slice(0, 3),
    restraint: vin[3],
    body: vin.slice(4, 7),
    engine: vin[7],
    check: vin[8],
    year: vin[9],
    plant: vin[10],
    sequence: vin.slice(11)
  };

  if (!VALID_VIN_CHARS.WMI.test(sections.wmi)) return false;
  if (!VALID_VIN_CHARS.RESTRAINT.test(sections.restraint)) return false;
  if (!VALID_VIN_CHARS.BODY.test(sections.body)) return false;
  if (!VALID_VIN_CHARS.ENGINE.test(sections.engine)) return false;
  if (!VALID_VIN_CHARS.CHECK.test(sections.check)) return false;
  if (!VALID_VIN_CHARS.YEAR.test(sections.year)) return false;
  if (!VALID_VIN_CHARS.PLANT.test(sections.plant)) return false;
  if (!VALID_VIN_CHARS.SEQUENCE.test(sections.sequence)) return false;

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[O0]{3,}/i,  // Too many zeros or O's in a row
    /[1I]{3,}/i,  // Too many ones or I's in a row
    /(.)\1{4,}/i, // Any character repeated more than 4 times
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(vin))) return false;

  return true;
}

export const analyzeVIN = (vin: string): VinPosition[] => {
  const positions: VinPosition[] = [];
  
  if (vin.length !== 17) {
    return Array(17).fill({ value: '', isValid: false, description: 'Missing character' });
  }

  // WMI (World Manufacturer Identifier)
  for (let i = 0; i < 3; i++) {
    positions.push({
      value: vin[i],
      isValid: /[A-HJ-NPR-Z0-9]/.test(vin[i]),
      description: 'World Manufacturer Identifier'
    });
  }

  // Restraint System Type / GVWR
  positions.push({
    value: vin[3],
    isValid: /[A-HJ-NPR-Z0-9]/.test(vin[3]),
    description: 'Restraint System / GVWR'
  });

  // Line, Series, Body Type
  for (let i = 4; i < 7; i++) {
    positions.push({
      value: vin[i],
      isValid: /[A-HJ-NPR-Z0-9]/.test(vin[i]),
      description: 'Line, Series, Body Type'
    });
  }

  // Engine Type
  positions.push({
    value: vin[7],
    isValid: /[A-HJ-NPR-Z0-9]/.test(vin[7]),
    description: 'Engine Type'
  });

  // Check Digit
  positions.push({
    value: vin[8],
    isValid: /[0-9X]/.test(vin[8]),
    description: 'Check Digit'
  });

  // Model Year
  positions.push({
    value: vin[9],
    isValid: vin[9] in MODEL_YEAR_CODES,
    description: 'Model Year'
  });

  // Assembly Plant
  positions.push({
    value: vin[10],
    isValid: /[A-HJ-NPR-Z0-9]/.test(vin[10]),
    description: 'Assembly Plant'
  });

  // Production Sequence Number
  for (let i = 11; i < 17; i++) {
    positions.push({
      value: vin[i],
      isValid: /[0-9]/.test(vin[i]),
      description: 'Production Sequence Number'
    });
  }

  return positions;
}

export const validateVinWithNHTSA = async (vin: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    if (!response.ok) {
      console.log('NHTSA API response not ok:', response.status);
      return false;
    }

    const data = await response.json();
    const results = data.Results;

    if (!Array.isArray(results)) {
      console.log('NHTSA API results not an array');
      return false;
    }

    // Check for basic vehicle information
    const makeResult = results.find((r: any) => r.Variable === 'Make' && r.Value && r.Value !== 'null');
    const modelResult = results.find((r: any) => r.Variable === 'Model' && r.Value && r.Value !== 'null');
    const yearResult = results.find((r: any) => r.Variable === 'Model Year' && r.Value && r.Value !== 'null');
    
    // Check for error codes in the response
    const errorCodes = results.find((r: any) => r.Variable === 'Error Code' && r.Value);
    if (errorCodes && errorCodes.Value !== '0') {
      console.log('NHTSA API returned error code:', errorCodes.Value);
      return false;
    }

    const isValid = !!(makeResult && modelResult && yearResult);
    console.log('NHTSA validation result:', isValid ? 'Valid' : 'Invalid');
    
    return isValid;
  } catch (error) {
    console.log('NHTSA API error:', error);
    return false;
  }
}
