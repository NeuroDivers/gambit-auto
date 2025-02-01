import { formatCurrency } from "@/lib/utils";

type Service = {
  id: string;
  service: {
    name: string;
    price: number | null;
  };
}

type ServicesListProps = {
  services: Service[];
}

export function ServicesList({ services = [] }: ServicesListProps) {
  if (!services || services.length === 0) {
    return (
      <div className="pt-4">
        <h2 className="font-semibold mb-4 text-[#1A1F2C]">Services / Services</h2>
        <p className="text-[#8E9196]">No services added</p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F1F0FB]">
            <th className="py-2 text-left text-[#8E9196] font-medium">Service / Service</th>
            <th className="py-2 text-left text-[#8E9196] font-medium">Description / Description</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Quantité / Quantity</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Prix unitaire / Unit Price</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Montant / Amount</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-b border-[#F1F0FB]">
              <td className="py-3 text-[#1A1F2C]">{service.service.name}</td>
              <td className="py-3 text-[#1A1F2C]">{service.service.name}</td>
              <td className="py-3 text-right text-[#1A1F2C]">1</td>
              <td className="py-3 text-right text-[#1A1F2C]">{formatCurrency(service.service.price || 0)}</td>
              <td className="py-3 text-right text-[#1A1F2C]">{formatCurrency(service.service.price || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}