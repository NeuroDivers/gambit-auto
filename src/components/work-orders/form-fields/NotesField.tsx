import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Control } from "react-hook-form"
import { WorkOrderFormValues } from "../types"

type NotesFieldProps = {
  control: Control<WorkOrderFormValues>
}

export function NotesField({ control }: NotesFieldProps) {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea 
              {...field} 
              className="min-h-[120px]"
              placeholder="Enter any additional notes or instructions..."
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}