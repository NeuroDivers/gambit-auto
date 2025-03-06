
import { ServiceDropdownProps, ServiceType } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ServiceDropdown({
  selectedServiceName,
  servicesByType,
  open,
  setOpen,
  handleServiceSelect,
  serviceId
}: ServiceDropdownProps) {
  return (
    <Select
      value={serviceId}
      onValueChange={handleServiceSelect}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a service">
          {selectedServiceName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(servicesByType).map(([category, services]) => (
          <div key={category}>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
