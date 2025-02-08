
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
  price: z.string().optional(),
  duration: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ServiceTypeFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export const ServiceTypeFormFields = ({ form }: ServiceTypeFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="service_name" className="text-white/[0.87]">Name</FormLabel>
            <FormControl>
              <Input 
                id="service_name"
                {...field} 
                className="bg-[#242424] border-white/10 text-white/[0.87]" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="service_status" className="text-white/[0.87]">Status</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger id="service_status" className="bg-[#242424] border-white/10 text-white/[0.87]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#242424] border-white/10">
                <SelectItem value="active" className="text-white/[0.87]">Active</SelectItem>
                <SelectItem value="inactive" className="text-white/[0.87]">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="service_description" className="text-white/[0.87]">Description</FormLabel>
            <FormControl>
              <Textarea 
                id="service_description"
                {...field} 
                className="bg-[#242424] border-white/10 text-white/[0.87]" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="service_price" className="text-white/[0.87]">Price (optional)</FormLabel>
            <FormControl>
              <Input
                id="service_price"
                {...field}
                type="number"
                step="0.01"
                className="bg-[#242424] border-white/10 text-white/[0.87]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="service_duration" className="text-white/[0.87]">Duration in minutes (optional)</FormLabel>
            <FormControl>
              <Input
                id="service_duration"
                {...field}
                type="number"
                className="bg-[#242424] border-white/10 text-white/[0.87]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export { formSchema };
