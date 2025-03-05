
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { ServiceSelectionFields } from "./ServiceSelectionFields"
import { SchedulingFields } from "./SchedulingFields"
import { AdditionalNotesField } from "./AdditionalNotesField"

interface FormSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
  customerId: string | null
}

export function FormSections({ form, isSubmitting, isEditing, customerId }: FormSectionsProps) {
  return (
    <div className="space-y-8">
      <CustomerInfoFields form={form} isEditing={isEditing} />
      <VehicleInfoFields form={form} isEditing={isEditing} customerId={customerId} />
      <ServiceSelectionFields form={form} />
      <SchedulingFields form={form} />
      <AdditionalNotesField form={form} isEditing={isEditing} />
    </div>
  )
}
