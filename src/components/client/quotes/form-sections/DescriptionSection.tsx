
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { MediaUploadField } from "@/components/work-orders/form-fields/MediaUploadField"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"

type DescriptionSectionProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
  mediaUrl: string | null
  uploading: boolean
  onFileUpload: (file: File) => Promise<void>
  onMediaRemove: () => void
}

const formSchema = z.object({
  description: z.string().min(1, "Please describe the service you need"),
})

export function DescriptionSection({ 
  form, 
  mediaUrl, 
  uploading, 
  onFileUpload, 
  onMediaRemove 
}: DescriptionSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/90">Service Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Please describe the service you need..."
                className="min-h-[100px] bg-[#1A1F2C] border-zinc-800 text-white/90 placeholder:text-white/60"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <MediaUploadField
        onFileUpload={onFileUpload}
        mediaUrl={mediaUrl}
        uploading={uploading}
        onMediaRemove={onMediaRemove}
        label="Upload Images/Videos"
        description="Upload images or videos of the damage (max 10MB per file)"
      />
    </div>
  )
}
