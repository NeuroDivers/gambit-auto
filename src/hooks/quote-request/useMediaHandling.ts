
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function useMediaHandling() {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  const handleImageUpload = async (files: FileList) => {
    try {
      setUploading(true)
      const newUrls: string[] = []

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('quote-request-media')
          .getPublicUrl(fileName)

        if (publicUrlData?.publicUrl) {
          newUrls.push(publicUrlData.publicUrl)
        }
      }

      setUploadedUrls(prev => [...prev, ...newUrls])
      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
      return newUrls
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (url: string) => {
    try {
      const fileName = url.split('/').pop()
      if (!fileName) return

      const { error } = await supabase.storage
        .from('quote-request-media')
        .remove([fileName])

      if (error) throw error

      setUploadedUrls(prev => prev.filter(u => u !== url))
      toast.success('Image removed successfully')
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message)
    }
  }

  return {
    uploading,
    uploadedUrls,
    handleImageUpload,
    handleImageRemove
  }
}
