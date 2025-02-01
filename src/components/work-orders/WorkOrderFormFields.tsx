import * as z from "zod"
import { UseFormReturn } from "react-hook-form"
import { PersonalInfoFields } from "./form-fields/PersonalInfoFields"
import { VehicleInfoFields } from "./form-fields/VehicleInfoFields"
import { ServiceItemsField } from "./form-fields/ServiceItemsField"
import { MediaUploadField } from "./form-fields/MediaUploadField"
import { ContactPreferenceFields } from "./form-fields/ContactPreferenceFields"
import { AddressField } from "./form-fields/AddressField"
import { TimeframeField } from "./form-fields/TimeframeField"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"
import { useEffect } from "react"

const serviceItemSchema = z.object({
  service_id: z.string().uuid(),
  service_name: z.string(),
  quantity: z.number().min(1),
  unit_price: z.number().min(0)
})

export const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
  contact_preference: z.enum(["phone", "email"]),
  service_items: z.array(serviceItemSchema).min(1, "Please select at least one service"),
  vehicle_make: z.string().min(2, "Vehicle make must be at least 2 characters"),
  vehicle_model: z.string().min(2, "Vehicle model must be at least 2 characters"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_serial: z.string().optional(),
  additional_notes: z.string().optional(),
  timeframe: z.enum(["flexible", "asap", "within_week", "within_month"]),
  price: z.number().min(0, "Price must be a positive number").default(0),
  address: z.string().optional()
})

export type WorkOrderFormValues = z.infer<typeof formSchema>

type WorkOrderFormFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>
  onFileUpload: (file: File) => Promise<void>
  mediaUrl: string | null
  uploading: boolean
  onMediaRemove: () => void
}

export function WorkOrderFormFields({ 
  form, 
  onFileUpload, 
  mediaUrl, 
  uploading, 
  onMediaRemove 
}: WorkOrderFormFieldsProps) {
  const serviceItems = form.watch("service_items") || []
  const totalPrice = serviceItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price)
  }, 0)

  useEffect(() => {
    form.setValue("price", totalPrice)
  }, [totalPrice, form])

  return (
    <>
      <PersonalInfoFields form={form} />
      <AddressField form={form} />
      <ServiceItemsField form={form} />
      <MediaUploadField
        onFileUpload={onFileUpload}
        mediaUrl={mediaUrl}
        uploading={uploading}
        onMediaRemove={onMediaRemove}
      />
      <VehicleInfoFields form={form} />
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Price</FormLabel>
            <FormControl>
              <Input
                type="text"
                value={formatCurrency(field.value)}
                readOnly
                className="bg-muted"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="additional_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information about your request..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <TimeframeField form={form} />
      <ContactPreferenceFields form={form} />
    </>
  )
}