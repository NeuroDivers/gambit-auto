
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { CommissionRateFields } from "@/components/shared/form-fields/CommissionRateFields"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  base_price: z.string().refine(value => !value || !isNaN(parseFloat(value)), {
    message: "Base price must be a valid number"
  }),
  estimated_time: z.string().refine(value => !value || !isNaN(parseInt(value)), {
    message: "Estimated time must be a valid number"
  }),
  status: z.enum(["active", "inactive"]),
  commission_rate: z.number().nullable(),
  commission_type: z.enum(["percentage", "flat"]).nullable(),
  service_type: z.enum(["standalone", "sub_service", "bundle"]).default("standalone"),
  parent_service_id: z.string().optional(),
  pricing_model: z.enum(["flat_rate", "hourly", "variable"]).default("flat_rate")
})

export type ServiceTypeFormValues = z.infer<typeof formSchema>

export function ServiceTypeFormFields({ form }: { form: UseFormReturn<ServiceTypeFormValues> }) {
  const commissionRate = form.watch('commission_rate')
  const commissionType = form.watch('commission_type')

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
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active</FormLabel>
              <p className="text-sm text-muted-foreground">
                Service is available for selection
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
      />
    </div>
  )
}
