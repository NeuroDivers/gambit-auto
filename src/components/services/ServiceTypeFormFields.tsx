
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { CommissionRateFields } from "@/components/shared/form-fields/CommissionRateFields"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  base_price: z.string().refine(value => !value || !isNaN(parseFloat(value)), {
    message: "Base price must be a valid number"
  }),
  discount_price: z.string().refine(value => !value || !isNaN(parseFloat(value)), {
    message: "Discount price must be a valid number"
  }).optional(),
  estimated_time: z.string().refine(value => !value || !isNaN(parseInt(value)), {
    message: "Estimated time must be a valid number"
  }),
  status: z.enum(["active", "inactive"]),
  commission_rate: z.number().nullable(),
  commission_type: z.enum(["percentage", "flat"]).nullable(),
  service_type: z.enum(["standalone", "sub_service", "bundle"]).default("standalone"),
  parent_service_id: z.string().optional(),
  pricing_model: z.enum(["flat_rate", "hourly", "variable"]).default("flat_rate"),
  visible_on_app: z.boolean().default(true),
  visible_on_website: z.boolean().default(true)
})

export type ServiceTypeFormValues = z.infer<typeof formSchema>

export function ServiceTypeFormFields({ form }: { form: UseFormReturn<ServiceTypeFormValues> }) {
  const commissionRate = form.watch('commission_rate')
  const commissionType = form.watch('commission_type')
  const serviceType = form.watch('service_type')

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
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
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Service Type Selection */}
      <FormField
        control={form.control}
        name="service_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Type</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="standalone">Standalone</SelectItem>
                <SelectItem value="sub_service">Sub-service</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Only show parent service field if type is sub_service */}
      {serviceType === 'sub_service' && (
        <FormField
          control={form.control}
          name="parent_service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Service</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter parent service ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="base_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Base Price</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="estimated_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Time (minutes)</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Visibility Settings Section */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium text-base mb-3">Visibility Settings</h3>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Service is available for selection in this application
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === 'active'}
                  onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="visible_on_app"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible on Mobile App</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Service will be visible to users on the mobile application
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Service will be visible to users on the public website
                </p>
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
      
      {/* Commission fields removed */}
      <CommissionRateFields
        form={form}
        label="Service Commission"
        value={{
          rate: commissionRate,
          type: commissionType
        }}
        onChange={(value) => {
          form.setValue('commission_rate', value.rate)
          form.setValue('commission_type', value.type)
        }}
        hidden={true}
      />
    </div>
  )
}
