
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { FormField } from "@/components/ui/form";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BayAssignmentFieldProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function BayAssignmentField({ form }: BayAssignmentFieldProps) {
  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .eq("status", "available");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="assigned_bay_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign Service Bay</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a service bay" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {serviceBays?.map((bay) => (
                <SelectItem key={bay.id} value={bay.id}>
                  {bay.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
