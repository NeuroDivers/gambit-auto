
import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";
import { useFormContext } from "react-hook-form";

export function ServiceSelectionFields() {
  const form = useFormContext();
  
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="service_items"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Items</FormLabel>
            <FormControl>
              <ServiceSelectionField
                name="service_items" 
                label="Services"
                description="Add the services for this work order"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
