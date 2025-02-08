
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
  role: z.string(),
  first_name: z.string(),
  last_name: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface UserEditFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export const UserEditFormFields = ({ form }: UserEditFormFieldsProps) => {
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name, nicename");
      
      if (error) throw error;
      return data;
    },
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
                  {roles?.map((role) => (
                    <SelectItem 
                      key={role.id} 
                      value={role.id} 
                      className="text-white/[0.87]"
                    >
                      {role.nicename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
