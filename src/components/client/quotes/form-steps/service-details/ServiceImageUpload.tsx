
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, X } from "lucide-react"

type ServiceImageUploadProps = {
  images: string[]
  onImageUpload: (files: FileList) => Promise<void>
  onImageRemove: (url: string) => void
}

export function ServiceImageUpload({ images, onImageUpload, onImageRemove }: ServiceImageUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await onImageUpload(e.target.files)
    }
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-video">
              <img
                src={url}
                alt={`Service image ${index + 1}`}
                className={cn(
                  "rounded-lg object-cover w-full h-full",
                  "border border-border"
                )}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onImageRemove(url)}
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
        asChild
      >
        <label>
          <Upload className="h-4 w-4" />
          Upload Images
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </label>
      </Button>
      <p className="text-sm text-muted-foreground">
        Upload images to help us better understand your service needs.
      </p>
    </div>
  )
}
