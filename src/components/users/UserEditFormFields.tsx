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
    queryKey: ["work-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const isSidekick = form.watch("role") === "sidekick";

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

      {isSidekick && workOrders && (
        <FormField
          control={form.control}
          name="assigned_work_orders"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/[0.87]">Assign Work Orders</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    const currentValues = field.value || [];
                    if (!currentValues.includes(value)) {
                      field.onChange([...currentValues, value]);
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#242424] border-white/10 text-white/[0.87]">
                    <SelectValue placeholder="Select work orders" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#242424] border-white/10">
                    {workOrders.map((order) => (
                      <SelectItem 
                        key={order.id} 
                        value={order.id}
                        className="text-white/[0.87]"
                      >
                        Work Order #{order.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};