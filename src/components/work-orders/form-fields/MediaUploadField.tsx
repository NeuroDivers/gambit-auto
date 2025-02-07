
import { FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload } from "lucide-react"

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
      <FormLabel className="text-white/90">{label}</FormLabel>
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
          <div className="flex flex-col items-center justify-center w-full border-2 border-dashed border-zinc-700 rounded-lg p-8 bg-[#1A1F2C]">
            <Upload className="h-8 w-8 text-[#9b87f5] mb-2" />
            <p className="text-sm text-white/90 mb-1">Click or drag files to upload</p>
            <p className="text-xs text-white/60">Supported formats: JPG, PNG, MP4, MOV</p>
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onFileUpload(file)
                }
              }}
              disabled={uploading}
              className="hidden"
            />
          </div>
        )}
        {description && (
          <p className="text-sm text-white/60">
            {description}
          </p>
        )}
      </div>
    </FormItem>
  )
}
