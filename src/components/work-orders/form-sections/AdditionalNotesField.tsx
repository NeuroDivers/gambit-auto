
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdditionalNotesFieldProps {
  notes?: string;
  onChange?: (notes: string) => void;
}

export function AdditionalNotesField({ notes, onChange }: AdditionalNotesFieldProps) {
  const form = useFormContext();
  
  if (!form) {
    console.error("AdditionalNotesField must be used within a FormProvider");
    return null;
  }
  
  const { control } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="additional_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional information or special instructions here..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
