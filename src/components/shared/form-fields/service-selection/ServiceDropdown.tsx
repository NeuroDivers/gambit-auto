
import { ServiceDropdownProps, ServiceType } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ServiceDropdown({
  selectedValue,
  onServiceSelect,
  servicesList,
  isDisabled
}: ServiceDropdownProps) {
  return (
    <Select
      value={selectedValue}
      onValueChange={(value) => {
        const service = Object.values(servicesList)
          .flat()
          .find((s) => s.id === value);
        onServiceSelect(value, service?.name || '');
      }}
      disabled={isDisabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a service" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(servicesList).map(([category, services]) => (
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
