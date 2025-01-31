import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/functions/v1/upload-quote-media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      setMediaUrl(url)
      toast({
        title: "Success",
        description: "Media uploaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleMediaRemove = () => {
    setMediaUrl(null)
  }

  return {
    uploading,
    mediaUrl,
    handleFileUpload,
    handleMediaRemove,
    setMediaUrl
  }
}