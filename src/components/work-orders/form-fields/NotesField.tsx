import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import type { NotesFieldProps } from "../types/form"

export function NotesField({ form }: NotesFieldProps) {
  return (
    <FormField
      control={form.control}
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