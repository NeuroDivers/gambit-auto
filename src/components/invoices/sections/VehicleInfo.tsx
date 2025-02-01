type VehicleInfoProps = {
  make: string
  model: string
  year: number
  vin: string
}

export function VehicleInfo({ make, model, year, vin }: VehicleInfoProps) {
  return (
    <div>
      <h2 className="font-semibold mb-2 text-[#1A1F2C]">Véhicule / Vehicle:</h2>
      <div className="space-y-1">
        <p className="text-[#1A1F2C]">{year} {make} {model}</p>
        <p className="text-[#8E9196]">NIV / VIN: {vin}</p>
      </div>
    </div>
  )
}