
export const validateVin = (vin: string): boolean => {
  // Basic VIN validation (17 characters, alphanumeric excluding I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/
  return vinRegex.test(vin)
}
