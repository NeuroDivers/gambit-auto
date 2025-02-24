import { CommissionRateFields } from "@/components/shared/form-fields/CommissionRateFields"
import { UseFormReturn } from "react-hook-form"

export function DefaultCommissionForm({ form }: { form: UseFormReturn<any> }) {
  return (
    <CommissionRateFields
      form={form}
      namePrefix="default"
      label="Default Commission Rate"
      value={{
        rate: form.watch('commission_rate'),
        type: form.watch('commission_type')
      }}
      onChange={(value) => {
        form.setValue('commission_rate', value.rate)
        form.setValue('commission_type', value.type)
      }}
    />
  )
}
