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
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/[0.08] hover:bg-transparent">
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
              <TableRow 
                key={service.id} 
                className="border-b border-white/[0.08] transition-colors duration-200 hover:bg-white/[0.02]"
              >
                <TableCell className="text-white/[0.87] font-medium">{service.name}</TableCell>
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
                <TableCell className="text-white/60">{service.description || '-'}</TableCell>
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
                    className="text-white/60 hover:text-white/[0.87] hover:bg-white/[0.08] transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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