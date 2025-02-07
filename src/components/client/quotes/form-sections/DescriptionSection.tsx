
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"

type DescriptionSectionProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
  mediaUrls: string[]
  uploading: boolean
  onFileUpload: (files: FileList) => Promise<void>
  onMediaRemove: (url: string) => void
}

const formSchema = z.object({
  description: z.string().min(1, "Please describe the service you need"),
})

export function DescriptionSection({ 
  form, 
  mediaUrls, 
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
            <FormLabel>Service Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Please describe the service you need..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <FormLabel>Upload Vehicle Images</FormLabel>
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative aspect-video">
                <img
                  src={url}
                  alt={`Vehicle image ${index + 1}`}
                  className={cn(
                    "rounded-lg object-cover w-full h-full",
                    "border border-border"
                  )}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => onMediaRemove(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          disabled={uploading}
          asChild
        >
          <label>
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Images"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onFileUpload(e.target.files)
                }
              }}
              disabled={uploading}
            />
          </label>
        </Button>
        <p className="text-sm text-muted-foreground">
          Upload images of your vehicle to help us better understand your service needs.
        </p>
      </div>
    </div>
  )
}
