import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
  pricing_model: z.enum(["flat_rate", "hourly", "variable"]),
  base_price: z.string().optional(),
  discount_price: z.string().optional(),
  duration: z.string().optional(),
  service_type: z.enum(["standalone", "sub_service", "bundle"]),
  parent_service_id: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface ServiceTypeFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export const ServiceTypeFormFields = ({ form }: ServiceTypeFormFieldsProps) => {
  const { data: standaloneServices } = useQuery({
    queryKey: ["standaloneServices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name")
        .eq("service_type", "standalone")
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: form.watch("service_type") === "sub_service"
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-start">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  id="service_name"
                  {...field} 
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
            <FormItem className="flex flex-col space-y-2">
              <FormLabel>Status</FormLabel>
              <div className="flex flex-row items-center justify-between space-x-2 rounded-lg p-3 shadow-sm">
                <span className="text-sm font-normal">Active</span>
                <FormControl>
                  <Switch
                    checked={field.value === "active"}
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? "active" : "inactive");
                    }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="service_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger id="service_type">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="standalone">Standalone Service</SelectItem>
                <SelectItem value="sub_service">Sub Service</SelectItem>
                <SelectItem value="bundle">Service Bundle</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("service_type") === "sub_service" && (
        <FormField
          control={form.control}
          name="parent_service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Service</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger id="parent_service">
                    <SelectValue placeholder="Select parent service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {standaloneServices?.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="pricing_model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pricing Model</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger id="pricing_model">
                  <SelectValue placeholder="Select pricing model" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="flat_rate">Flat Rate</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="base_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price</FormLabel>
              <FormControl>
                <Input
                  id="service_base_price"
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discount_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Price</FormLabel>
              <FormControl>
                <Input
                  id="service_discount_price"
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                id="service_description"
                {...field} 
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
            <FormLabel>Duration in minutes (optional)</FormLabel>
            <FormControl>
              <Input
                id="service_duration"
                {...field}
                type="number"
                step="1"
                min="0"
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
