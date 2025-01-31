import { FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"

type MediaUploadFieldProps = {
  onFileUpload: (file: File) => Promise<void>
  mediaUrl: string | null
  uploading: boolean
  onMediaRemove: () => void
}

export function MediaUploadField({ 
  onFileUpload, 
  mediaUrl, 
  uploading, 
  onMediaRemove 
}: MediaUploadFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  return (
    <div className="space-y-4">
      <FormLabel>Media Upload</FormLabel>
      <div 
        onClick={() => document.getElementById('file-upload')?.click()}
        className={`
          relative cursor-pointer
          border-2 border-dashed border-border
          rounded-lg p-8
          flex flex-col items-center justify-center
          transition-colors
          hover:border-[#9b87f5]
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <ImageIcon className="h-10 w-10 mb-4 text-[#9b87f5]" />
        <div className="text-center space-y-2">
          <h3 className="font-semibold">Click or drag files to upload</h3>
          <p className="text-sm text-muted-foreground">
            Supported formats: JPG, PNG, MP4, MOV
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*,video/mp4,video/quicktime"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Upload images or videos of the damage (max 10MB per file)
      </p>
      {mediaUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-background">
          <img
            src={mediaUrl}
            alt="Uploaded preview"
            className="w-full h-full object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onMediaRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}