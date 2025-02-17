
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function useMediaHandling() {
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (files: FileList, serviceId: string) => {
    try {
      setUploading(true)
      const newUrls: string[] = []

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('quote-request-media')
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }

      return newUrls
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image: ' + error.message)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (url: string) => {
    try {
      // Extract the file path from the public URL
      const filePath = url.split('/').pop()
      if (!filePath) throw new Error('Invalid file URL')

      const { error } = await supabase.storage
        .from('quote-request-media')
        .remove([filePath])

      if (error) throw error

      toast.success('Image removed successfully')
    } catch (error: any) {
      console.error('Error removing image:', error)
      toast.error('Failed to remove image: ' + error.message)
      throw error
    }
  }

  return {
    uploading,
    handleImageUpload,
    handleImageRemove
  }
}
