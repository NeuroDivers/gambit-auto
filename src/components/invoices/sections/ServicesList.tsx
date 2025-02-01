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
      <div className="border-t pt-4">
        <h2 className="font-semibold mb-4 text-[#222222]">Services / Services</h2>
        <p className="text-[#555555]">No services added</p>
      </div>
    );
  }

  return (
    <div className="border-t pt-4">
      <table className="w-full">
        <thead>
          <tr className="text-left text-[#222222]">
            <th className="py-2">Service / Service</th>
            <th className="py-2">Description / Description</th>
            <th className="py-2 text-right">Quantité / Quantity</th>
            <th className="py-2 text-right">Prix unitaire / Unit Price</th>
            <th className="py-2 text-right">Montant / Amount</th>
          </tr>
        </thead>
        <tbody className="text-[#333333]">
          {services.map((service) => (
            <tr key={service.id} className="border-t">
              <td className="py-2">{service.service.name}</td>
              <td className="py-2">{service.service.name}</td>
              <td className="py-2 text-right">1</td>
              <td className="py-2 text-right">{formatCurrency(service.service.price || 0)}</td>
              <td className="py-2 text-right">{formatCurrency(service.service.price || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}