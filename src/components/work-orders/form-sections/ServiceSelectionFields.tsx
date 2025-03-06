
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceItemType } from "@/types/service-item";
import ServiceSelectionField from "@/components/shared/form-fields/ServiceSelectionField";

type ServiceSelectionFieldsProps = {
  services: ServiceItemType[];
  onChange: (newServices: ServiceItemType[]) => void;
  disabled?: boolean;
  showCommission?: boolean;
};

export function ServiceSelectionFields({
  services,
  onChange,
  disabled = false,
  showCommission = false,
}: ServiceSelectionFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Selection</CardTitle>
      </CardHeader>
      <ServiceSelectionField
        services={services}
        onChange={onChange}
        disabled={disabled}
        showCommission={showCommission}
      />
    </Card>
  );
}
