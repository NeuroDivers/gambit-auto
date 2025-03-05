
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { FormField } from "@/components/ui/form";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface NotesFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
  disabled?: boolean;
}

export function NotesFields({ form, disabled }: NotesFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="additional_notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Additional Notes</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder="Enter any additional notes here..." disabled={disabled} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
