import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { FormField } from "@/components/ui/form";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BayAssignmentFieldProps {
  form: UseFormReturn<WorkOrderFormValues>;
  disabled?: boolean;
}

export function BayAssignmentField({ form, disabled }: BayAssignmentFieldProps) {
  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .eq("status", "available");
      
      if (error) throw error;
      
      // Sort the bays:
      // 1. Extract numeric prefix if it exists
      // 2. Sort numerically first, then alphabetically
      return data.sort((a, b) => {
        const aMatch = a.name.match(/^(\d+)/);
        const bMatch = b.name.match(/^(\d+)/);
        
        // If both have numeric prefixes, sort by number
        if (aMatch && bMatch) {
          const aNum = parseInt(aMatch[1], 10);
          const bNum = parseInt(bMatch[1], 10);
          if (aNum !== bNum) {
            return aNum - bNum;
          }
        }
        
        // If only one has a numeric prefix, put it first
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        
        // Otherwise sort alphabetically
        return a.name.localeCompare(b.name);
      });
    },
  });

  return (
    <FormField
      control={form.control}
      name="assigned_bay_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign Service Bay</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined} disabled={disabled}>
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
