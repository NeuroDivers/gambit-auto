
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";
import { ServiceItemType } from "@/types/service-item";

export function ServiceSelectionFields() {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Services</h3>
      <FormField
        control={form.control}
        name="service_items"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ServiceSelectionField
                value={field.value}
                onChange={field.onChange}
                showCommission={true}
                showAssignedStaff={true}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
