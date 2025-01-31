import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { PersonalInfoFields } from "./form-fields/PersonalInfoFields"
import { VehicleInfoFields } from "./form-fields/VehicleInfoFields"
import { ServiceSelectionField } from "./form-fields/ServiceSelectionField"
import { MediaUploadField } from "./form-fields/MediaUploadField"
import { ContactPreferenceFields } from "./form-fields/ContactPreferenceFields"

const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
  contact_preference: z.enum(["phone", "email"]),
  service_id: z.string().uuid("Please select a service"),
  vehicle_make: z.string().min(2, "Vehicle make must be at least 2 characters"),
  vehicle_model: z.string().min(2, "Vehicle model must be at least 2 characters"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_serial: z.string().optional(),
  additional_notes: z.string().optional(),
  timeframe: z.enum(["flexible", "asap", "within_week", "within_month"]),
})

type QuoteRequestFormFieldsProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
  onFileUpload: (file: File) => Promise<void>
  mediaUrl: string | null
  uploading: boolean
  onMediaRemove: () => void
}

export function QuoteRequestFormFields({ 
  form, 
  onFileUpload, 
  mediaUrl, 
  uploading, 
  onMediaRemove 
}: QuoteRequestFormFieldsProps) {
  return (
    <>
      <PersonalInfoFields form={form} />
      <VehicleInfoFields form={form} />
      <ServiceSelectionField form={form} />
      <MediaUploadField
        onFileUpload={onFileUpload}
        mediaUrl={mediaUrl}
        uploading={uploading}
        onMediaRemove={onMediaRemove}
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
      <ContactPreferenceFields form={form} />
    </>
  )
}

export { formSchema }