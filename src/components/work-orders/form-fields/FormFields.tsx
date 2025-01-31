import { FormField } from "@/components/ui/form"
import { BaySelectionField } from "./BaySelectionField"
import { DateTimeFields } from "./DateTimeFields"
import { NotesField } from "./NotesField"
import { StatusField } from "./StatusField"
import { ServiceSelectionField } from "../../quotes/form-fields/ServiceSelectionField"
import type { UseFormReturn } from "react-hook-form"
import type { WorkOrderFormValues } from "../types/form"

interface FormFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>
}

export function FormFields({ form }: FormFieldsProps) {
  return (
    <div className="space-y-4">
      <ServiceSelectionField form={form} />
      <BaySelectionField form={form} />
      <DateTimeFields form={form} />
      <StatusField form={form} />
      <NotesField form={form} />
    </div>
  )
}