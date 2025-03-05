
import { ServiceItemType } from "@/components/shared/form-fields/service-selection/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock package data
const PACKAGES = [
  {
    id: "pkg1",
    name: "Basic Service Package",
    services: [
      {
        service_id: "svc1",
        service_name: "Oil Change",
        description: "Standard oil change with filter",
        quantity: 1,
        unit_price: 49.99,
        commission_rate: 5,
        commission_type: "percentage",
        assigned_profile_id: null,
        assigned_profiles: [],
      },
      {
        service_id: "svc2",
        service_name: "Tire Rotation",
        description: "Rotate tires to ensure even wear",
        quantity: 1,
        unit_price: 29.99,
        commission_rate: 5,
        commission_type: "percentage",
        assigned_profile_id: null,
        assigned_profiles: [],
      },
    ],
  },
  {
    id: "pkg2",
    name: "Premium Service Package",
    services: [
      {
        service_id: "svc1",
        service_name: "Oil Change",
        description: "Premium synthetic oil change with filter",
        quantity: 1,
        unit_price: 79.99,
        commission_rate: 5,
        commission_type: "percentage",
        assigned_profile_id: null,
        assigned_profiles: [],
      },
      {
        service_id: "svc2",
        service_name: "Tire Rotation",
        description: "Rotate tires to ensure even wear",
        quantity: 1,
        unit_price: 29.99,
        commission_rate: 5,
        commission_type: "percentage",
        assigned_profile_id: null,
        assigned_profiles: [],
      },
      {
        service_id: "svc3",
        service_name: "Multi-Point Inspection",
        description: "Comprehensive vehicle inspection",
        quantity: 1,
        unit_price: 49.99,
        commission_rate: 5,
        commission_type: "percentage",
        assigned_profile_id: null,
        assigned_profiles: [],
      },
    ],
  },
];

interface PackageSelectProps {
  onSelect: (services: ServiceItemType[]) => void;
  onCancel: () => void;
}

export function PackageSelect({ onSelect, onCancel }: PackageSelectProps) {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select a Service Package</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
              onClick={() => onSelect(pkg.services)}
            >
              <h3 className="font-medium text-lg">{pkg.name}</h3>
              <ul className="mt-2 space-y-1">
                {pkg.services.map((service) => (
                  <li key={service.service_id} className="text-sm flex justify-between">
                    <span>{service.service_name}</span>
                    <span>${service.unit_price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-right font-medium">
                Total: $
                {pkg.services
                  .reduce((sum, svc) => sum + svc.unit_price * svc.quantity, 0)
                  .toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
