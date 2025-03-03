
import { UseFormReturn } from "react-hook-form"
import { ClientFormValues } from "../schemas/clientFormSchema"
import { PersonalInfoFields } from "@/components/shared/form-sections/PersonalInfoFields"
import { AddressFields } from "@/components/shared/form-sections/AddressFields"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

interface ClientFormFieldsProps {
  form: UseFormReturn<ClientFormValues>
}

export function ClientFormFields({ form }: ClientFormFieldsProps) {
  return (
    <div className="space-y-4">
      <PersonalInfoFields form={form} fieldPrefix="" />
      <AddressFields form={form} fieldPrefix="" />
      
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Additional notes or comments" 
                {...field} 
                className="min-h-[100px]"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
