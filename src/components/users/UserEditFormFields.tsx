import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MultiSelect } from "@/components/ui/multi-select";

export const formSchema = z.object({
  role: z.enum(["admin", "manager", "sidekick", "client"]),
  first_name: z.string(),
  last_name: z.string(),
  assigned_work_orders: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UserEditFormFieldsProps {
  form: UseFormReturn<FormData>;
  defaultValues: FormData;
}

export const UserEditFormFields = ({ form }: UserEditFormFieldsProps) => {
  const { data: workOrders } = useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("id, quote_requests(first_name, last_name)")
        .is("assigned_sidekick_id", null);
      
      if (error) throw error;
      return data;
    },
    enabled: form.watch("role") === "sidekick",
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="first_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/[0.87]">First Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="John" 
                {...field} 
                className="bg-[#242424] border-white/10 text-white/[0.87]"
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/[0.87]">Last Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Doe" 
                {...field} 
                className="bg-[#242424] border-white/10 text-white/[0.87]"
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/[0.87]">Role</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="bg-[#242424] border-white/10 text-white/[0.87]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-[#242424] border-white/10">
                  <SelectItem value="admin" className="text-white/[0.87]">Admin</SelectItem>
                  <SelectItem value="manager" className="text-white/[0.87]">Manager</SelectItem>
                  <SelectItem value="sidekick" className="text-white/[0.87]">Sidekick</SelectItem>
                  <SelectItem value="client" className="text-white/[0.87]">Client</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />

      {form.watch("role") === "sidekick" && (
        <FormField
          control={form.control}
          name="assigned_work_orders"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/[0.87]">Assign Work Orders</FormLabel>
              <FormControl>
                <MultiSelect
                  options={workOrders?.map(wo => ({
                    label: `Work Order for ${wo.quote_requests?.first_name} ${wo.quote_requests?.last_name}`,
                    value: wo.id
                  })) || []}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select work orders"
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};