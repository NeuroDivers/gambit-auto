
import { UseFormReturn } from "react-hook-form"
import { ServiceItemsField } from "../form-fields/ServiceItemsField"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { TimeSelectionFields } from "./TimeSelectionFields"
import { WorkOrderFormHeader } from "./WorkOrderFormHeader"

interface FormSectionsProps {
  form: UseFormReturn<any>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <WorkOrderFormHeader isEditing={isEditing} />
      
      <CustomerInfoFields form={form} />
      <VehicleInfoFields form={form} />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Services</h3>
        <ServiceItemsField
          services={form.watch('service_items')}
          onServicesChange={(services) => form.setValue('service_items', services)}
          disabled={isSubmitting}
        />
      </div>
      
      <TimeSelectionFields form={form} />
    </div>
  )
}
