
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { FormField } from "@/components/ui/form";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface NotesFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function NotesFields({ form }: NotesFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="additional_notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Additional Notes</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder="Enter any additional notes here..." className="min-h-[100px]" />
          </FormControl>
          <FormDescription>
            These notes will be visible in calendar views and work order details
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
