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
        <h2 className="font-semibold mb-4">Services</h2>
        <p className="text-muted-foreground">No services added</p>
      </div>
    );
  }

  return (
    <div className="border-t pt-4">
      <h2 className="font-semibold mb-4">Services</h2>
      <div className="space-y-2">
        {services.map((service) => (
          <div key={service.id} className="flex justify-between">
            <span>{service.service.name}</span>
            <span>{formatCurrency(service.service.price || 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}