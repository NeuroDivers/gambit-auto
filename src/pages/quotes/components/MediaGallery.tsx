
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"

interface MediaGalleryProps {
  mediaUrls: string[] | null
  status: string
  onRemoveImage: (url: string) => void
}

export function MediaGallery({ mediaUrls, status, onRemoveImage }: MediaGalleryProps) {
  if (!mediaUrls || mediaUrls.length === 0) {
    return <p className="text-muted-foreground">No images uploaded</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaUrls.map((url, index) => {
        const publicUrl = url.startsWith('http') ? url : supabase.storage
          .from('quote-request-media')
          .getPublicUrl(url).data.publicUrl

        return (
          <div key={index} className="relative aspect-square">
            <img 
              src={publicUrl}
              alt={`Quote request image ${index + 1}`}
              className="rounded-lg object-cover w-full h-full border border-border"
            />
            {["pending", "estimated"].includes(status) && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onRemoveImage(url)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
