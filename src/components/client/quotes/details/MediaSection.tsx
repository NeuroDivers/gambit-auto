
import { Button } from "@/components/ui/button"
import { ImageGallery } from "@/components/client/quotes/ImageGallery"
import { Upload } from "lucide-react"
import type { QuoteRequest } from "@/types/quote-request"

type MediaSectionProps = {
  quoteRequest: QuoteRequest
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: (url: string) => void
  uploading: boolean
}

export function MediaSection({ quoteRequest, onFileUpload, onImageRemove, uploading }: MediaSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Images</h3>
        {["pending", "estimated"].includes(quoteRequest.status) && (
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={onFileUpload}
                disabled={uploading}
              />
            </label>
          </Button>
        )}
      </div>
      {quoteRequest.media_urls && quoteRequest.media_urls.length > 0 ? (
        <ImageGallery
          mediaUrls={quoteRequest.media_urls}
          status={quoteRequest.status}
          onImageRemove={onImageRemove}
        />
      ) : (
        <p className="text-muted-foreground">No images uploaded</p>
      )}
    </div>
  )
}
