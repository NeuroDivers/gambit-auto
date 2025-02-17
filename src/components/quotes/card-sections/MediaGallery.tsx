
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import type { QuoteRequest } from "@/types/quote-request"

interface MediaGalleryProps {
  request: QuoteRequest
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: (url: string, quoteId: string, currentUrls: string[]) => void
  isUploading: boolean
  uploadKey: number
}

export function MediaGallery({ 
  request, 
  onImageUpload, 
  onImageRemove, 
  isUploading,
  uploadKey 
}: MediaGalleryProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium">Images</h4>
        <Button variant="outline" size="sm" asChild>
          <label className="cursor-pointer">
            <input
              key={uploadKey}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={onImageUpload}
              disabled={isUploading}
            />
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Add Images"}
          </label>
        </Button>
      </div>
      {request.media_urls && request.media_urls.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {request.media_urls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="rounded-md object-cover w-full aspect-video"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onImageRemove(request.id, url, request.media_urls || [])}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No images uploaded</p>
      )}
    </div>
  )
}
