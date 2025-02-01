type VehicleInfoProps = {
  year: number;
  make: string;
  model: string;
  serial: string;
}

export function VehicleInfo({ year, make, model, serial }: VehicleInfoProps) {
  return (
    <div>
      <h2 className="font-semibold mb-2 text-[#1A1F2C]">Véhicule / Vehicle:</h2>
      <div className="space-y-1">
        <p className="text-[#1A1F2C]">{year} {make} {model}</p>
        <p className="text-[#8E9196]">NIV / VIN: {serial}</p>
      </div>
    </div>
  );
}