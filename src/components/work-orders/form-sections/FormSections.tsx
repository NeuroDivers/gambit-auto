
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
  const { control, watch, setValue } = form;
  
  return (
    <div className="space-y-8">
      <CustomerInfoFields control={control} />
      <VehicleInfoFields control={control} watch={watch} setValue={setValue} />
      <ServiceSelectionFields form={form} />
      <SchedulingFields form={form} />
      <BayAssignmentField form={form} />
      <NotesFields form={form} />
    </div>
  )
}
