
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

type ImageGalleryProps = {
  mediaUrls: string[]
  status: string
  onImageRemove: (url: string) => void
}

export function ImageGallery({ mediaUrls, status, onImageRemove }: ImageGalleryProps) {
  const getPublicUrl = (filePath: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from('quote-request-media')
      .getPublicUrl(filePath)
    return publicUrl
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold mb-2">Uploaded Images:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mediaUrls.map((url, index) => (
          <div key={index} className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <img 
              src={getPublicUrl(url)}
              alt={`Vehicle image ${index + 1}`}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            {["pending", "estimated"].includes(status) && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onImageRemove(url)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
