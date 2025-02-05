import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useMediaUpload(bucket: string = 'quote-request-media') {
  const [uploading, setUploading] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const filePath = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setMediaUrl(publicUrl)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error uploading file",
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