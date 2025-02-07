import { FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

type MediaUploadFieldProps = {
  onFileUpload: (file: File) => Promise<void>
  mediaUrl: string | null
  uploading: boolean
  onMediaRemove: () => void
  label?: string
  description?: string
  imageClassName?: string
}

export function MediaUploadField({
  onFileUpload,
  mediaUrl,
  uploading,
  onMediaRemove,
  label = "Upload Media",
  description,
  imageClassName
}: MediaUploadFieldProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-4">
        {mediaUrl ? (
          <div className="relative w-full">
            <img
              src={mediaUrl}
              alt="Uploaded media"
              className={`rounded-lg ${imageClassName || "aspect-video object-cover w-full h-full"}`}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onMediaRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                onFileUpload(file)
              }
            }}
            disabled={uploading}
          />
        )}
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </FormItem>
  )
}