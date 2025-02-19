
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

interface UserFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export const UserFormFields = ({ form }: UserFormFieldsProps) => {
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
            <FormLabel className="text-gray-700" htmlFor="first_name">First Name</FormLabel>
            <FormControl>
              <Input 
                id="first_name"
                placeholder="John" 
                {...field} 
                className="bg-white border-gray-200 text-gray-900"
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
            <FormLabel className="text-gray-700" htmlFor="last_name">Last Name</FormLabel>
            <FormControl>
              <Input 
                id="last_name"
                placeholder="Doe" 
                {...field} 
                className="bg-white border-gray-200 text-gray-900"
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
            <FormLabel className="text-gray-700" htmlFor="role">Role</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger id="role" className="bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {roles?.map((role) => (
                    <SelectItem 
                      key={role.id} 
                      value={role.id} 
                      className="text-gray-700"
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
