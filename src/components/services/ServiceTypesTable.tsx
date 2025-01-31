import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ServiceTypeDialog } from "./ServiceTypeDialog";

interface ServiceType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  description: string | null;
  price: number | null;
  duration: number | null;
}

interface ServiceTypesTableProps {
  serviceTypes: ServiceType[];
  onRefetch: () => void;
}

export const ServiceTypesTable = ({ serviceTypes, onRefetch }: ServiceTypesTableProps) => {
  const [editingService, setEditingService] = useState<ServiceType | null>(null);

  return (
    <>
      <Table>
        <TableHeader className="bg-[#242424]">
          <TableRow>
            <TableHead className="text-white/60">Name</TableHead>
            <TableHead className="text-white/60">Status</TableHead>
            <TableHead className="text-white/60">Description</TableHead>
            <TableHead className="text-white/60">Price</TableHead>
            <TableHead className="text-white/60">Duration</TableHead>
            <TableHead className="text-white/60 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceTypes.map((service) => (
            <TableRow key={service.id} className="border-t border-white/10">
              <TableCell className="text-white/[0.87]">{service.name}</TableCell>
              <TableCell>
                {service.status === 'active' ? (
                  <span className="flex items-center text-[#03DAC5]">
                    <Check className="w-4 h-4 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center text-white/40">
                    <X className="w-4 h-4 mr-1" />
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell className="text-white/60">{service.description}</TableCell>
              <TableCell className="text-white/60">
                {service.price ? `$${service.price.toFixed(2)}` : '-'}
              </TableCell>
              <TableCell className="text-white/60">
                {service.duration ? `${service.duration} min` : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingService(service)}
                  className="text-white/60 hover:text-white/[0.87] hover:bg-[#242424]"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ServiceTypeDialog
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
        serviceType={editingService}
        onSuccess={() => {
          setEditingService(null);
          onRefetch();
        }}
      />
    </>
  );
};