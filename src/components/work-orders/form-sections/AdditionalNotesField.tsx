
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdditionalNotesFieldProps {
  notes?: string;
  onChange?: (notes: string) => void;
  value?: string;
}

export function AdditionalNotesField({ notes, onChange, value }: AdditionalNotesFieldProps) {
  const form = useFormContext();
  
  // If we're not in a form context, use controlled component
  if (!form) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea 
              placeholder="Enter any additional information or special instructions here..."
              className="min-h-[120px]"
              value={value || notes || ""}
              onChange={(e) => onChange && onChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If in form context, use FormField
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
