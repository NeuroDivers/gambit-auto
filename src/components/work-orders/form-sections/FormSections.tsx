import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { TimeSelectionFields } from "./TimeSelectionFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { BayAssignmentField } from "../form-fields/BayAssignmentField"

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
          <BayAssignmentField form={form} />
        </div>
        <div className="space-y-8">
          <VehicleInfoFields form={form} />
          <ServiceSelectionField form={form} />
        </div>
      </div>
    </div>
  )
}