
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { UseFormReturn } from "react-hook-form"

type InvoiceServiceItemsProps = {
  form: UseFormReturn<any>
}

export function InvoiceServiceItems({ form }: InvoiceServiceItemsProps) {
  return <ServiceSelectionField form={form} />
}
