
import { useFormContext } from "react-hook-form"
import { FormField, FormItem } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"

export function ServiceSelectionFields() {
  const { control } = useFormContext()

  return (
    <div className="space-y-6 py-2">
      <div>
        <h3 className="text-lg font-medium mb-4">Services</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add the services that will be performed for this work order.
        </p>
        
        <FormField
          control={control}
          name="service_items"
          render={({ field }) => (
            <FormItem>
              <ServiceSelectionField 
                value={field.value} 
                onChange={field.onChange}
                showAssignedStaff={true}
                showCommission={true}
              />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
