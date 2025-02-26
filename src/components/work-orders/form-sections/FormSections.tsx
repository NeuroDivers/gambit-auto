
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { ServiceSelectionFields } from "./ServiceSelectionFields"
import { NotesFields } from "./NotesFields"
import { SchedulingFields } from "./SchedulingFields"
import { BayAssignmentField } from "./BayAssignmentField"

interface FormSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  return (
    <div className="space-y-8">
      <CustomerInfoFields form={form} />
      <VehicleInfoFields form={form} />
      <ServiceSelectionFields form={form} />
      <SchedulingFields form={form} />
      <BayAssignmentField form={form} />
      <NotesFields form={form} />
    </div>
  )
}
