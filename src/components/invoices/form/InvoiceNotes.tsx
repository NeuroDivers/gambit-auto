import { Control } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

type InvoiceNotesProps = {
  control: Control<any>
}

export function InvoiceNotes({ control }: InvoiceNotesProps) {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Add notes to this invoice..." 
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}