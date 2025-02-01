type VehicleInfoProps = {
  year: number;
  make: string;
  model: string;
  serial: string;
}

export function VehicleInfo({ year, make, model, serial }: VehicleInfoProps) {
  return (
    <div className="border-t pt-4">
      <h2 className="font-semibold mb-2">Vehicle Information</h2>
      <p>{year} {make} {model}</p>
      <p>Serial: {serial}</p>
    </div>
  );
}