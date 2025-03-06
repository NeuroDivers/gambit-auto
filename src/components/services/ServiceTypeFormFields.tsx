
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function ServiceTypeFormFields() {
  const form = useFormContext();
  const serviceType = form.watch('service_type') || 'standalone';
  
  const { data: parentServices = [], isLoading: isLoadingParentServices } = useQuery({
    queryKey: ["parent-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name")
        .eq("service_type", "standalone")
        .order("name", { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: serviceType === 'sub_service' // Only fetch if sub_service is selected
  });

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter service name" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter service description"
                className="min-h-[100px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="service_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Type</FormLabel>
            <FormControl>
              <Select
                value={field.value || 'standalone'}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="standalone">Standalone</SelectItem>
                  <SelectItem value="sub_service">Sub Service</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
      
      {serviceType === 'sub_service' && (
        <FormField
          control={form.control}
          name="parent_service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Service</FormLabel>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={isLoadingParentServices}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select parent service" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {parentServices.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="base_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Base Price ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0.00" 
                min="0" 
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                value={field.value}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (minutes)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="60" 
                min="0"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                value={field.value}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="visible_on_app"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible on App</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Show this service in the mobile app
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="visible_on_website"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible on Website</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Show this service on the public website
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
