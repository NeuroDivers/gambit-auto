import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { TimeSelectionFields } from "./TimeSelectionFields"
import { ServiceItemsField } from "../form-fields/ServiceItemsField"

type FormSectionsProps = {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <CustomerInfoFields form={form} />
          <TimeSelectionFields form={form} />
        </div>
        <div className="space-y-8">
          <VehicleInfoFields form={form} />
          <ServiceItemsField
            services={form.getValues("service_items")}
            onServicesChange={(services) => form.setValue("service_items", services)}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}