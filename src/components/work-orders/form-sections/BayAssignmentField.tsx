
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BayAssignmentFieldProps {
  bayId?: string | null;
  onChange?: (bayId: string | null) => void;
}

export function BayAssignmentField({ bayId, onChange }: BayAssignmentFieldProps) {
  const form = useFormContext();
  
  if (!form) {
    console.error("BayAssignmentField must be used within a FormProvider");
    return null;
  }
  
  const { control } = form;

  const { data: serviceBays, isLoading } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bay Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="assigned_bay_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign to Bay</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bay" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {!isLoading && serviceBays?.map((bay: any) => (
                    <SelectItem key={bay.id} value={bay.id}>
                      {bay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
