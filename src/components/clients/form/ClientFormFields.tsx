
import { UseFormReturn } from "react-hook-form"
import { ClientFormValues } from "../schemas/clientFormSchema"
import { PersonalInfoFields } from "@/components/shared/form-sections/PersonalInfoFields"
import { AddressFields } from "@/components/shared/form-sections/AddressFields"

interface ClientFormFieldsProps {
  form: UseFormReturn<ClientFormValues>
}

export function ClientFormFields({ form }: ClientFormFieldsProps) {
  return (
    <div className="space-y-4">
      <PersonalInfoFields form={form} fieldPrefix="" />
      <AddressFields form={form} fieldPrefix="" />
    </div>
  )
}
