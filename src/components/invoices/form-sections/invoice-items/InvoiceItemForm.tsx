
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { InvoiceItem } from "../../types"
import { SearchableSelect, Option } from "@/components/shared/form-fields/searchable-select/SearchableSelect"

type ServiceItemFormProps = {
  item: InvoiceItem
  index: number
  onUpdate: (index: number, field: keyof InvoiceItem, value: string | number | null) => void
  onRemove: (index: number) => void
}

export function InvoiceItemForm({ item, index, onUpdate, onRemove }: ServiceItemFormProps) {
  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select(`
          id,
          name,
          description,
          price,
          status,
          service_type,
          service_packages(
            id,
            name,
            description,
            price,
            sale_price,
            status
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  const selectedService = services?.find(service => service.id === item.service_id);
  const availablePackages = selectedService?.service_packages?.filter(pkg => pkg.status === 'active') || [];

  const serviceOptions: Option[] = services?.map(service => ({
    value: service.id,
    label: service.name,
    price: service.price,
  })) || [];

  const packageOptions: Option[] = availablePackages.map(pkg => ({
    value: pkg.id,
    label: pkg.name,
    price: pkg.price || pkg.sale_price,
  }));

  const handleServiceSelect = (serviceId: string) => {
    const selectedService = services?.find(service => service.id === serviceId);
    if (selectedService) {
      onUpdate(index, "service_id", serviceId);
      onUpdate(index, "service_name", selectedService.name);
      onUpdate(index, "description", selectedService.description || '');
      onUpdate(index, "unit_price", selectedService.price || 0);
      onUpdate(index, "package_id", null);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    const selectedPackage = availablePackages.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      onUpdate(index, "package_id", packageId);
      onUpdate(index, "service_name", selectedPackage.name);
      onUpdate(index, "description", selectedPackage.description || '');
      onUpdate(index, "unit_price", selectedPackage.price || selectedPackage.sale_price || 0);
    }
  };

  return (
    <Card className="relative border rounded-lg hover:border-primary/50 transition-colors">
      <CardContent className="p-4 space-y-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="grid gap-4">
          <div>
            <Label>Service</Label>
            <SearchableSelect
              options={serviceOptions}
              value={item.service_id || ''}
              onValueChange={handleServiceSelect}
              placeholder={isServicesLoading ? "Loading services..." : "Select a service"}
              showPrice={true}
              disabled={isServicesLoading}
            />
          </div>

          {packageOptions.length > 0 && (
            <div>
              <Label>Package</Label>
              <SearchableSelect
                options={packageOptions}
                value={item.package_id || ''}
                onValueChange={handlePackageSelect}
                placeholder="Select a package"
                showPrice={true}
              />
            </div>
          )}

          <div>
            <Label>Description</Label>
            <Textarea
              value={item.description || ''}
              onChange={(e) => onUpdate(index, "description", e.target.value)}
              placeholder="Enter description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdate(index, "quantity", parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => onUpdate(index, "unit_price", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
