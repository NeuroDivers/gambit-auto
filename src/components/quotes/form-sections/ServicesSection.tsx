
import { ServiceSelectionField } from "@/components/shared/form-fields/service-selection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceItemType } from "@/types/service-item";

interface ServicesSectionProps {
  services: ServiceItemType[];
  onChange: (services: ServiceItemType[]) => void;
}

export const ServicesSection = ({ services, onChange }: ServicesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent>
        <ServiceSelectionField 
          services={services} 
          onChange={onChange} 
        />
      </CardContent>
    </Card>
  );
};
