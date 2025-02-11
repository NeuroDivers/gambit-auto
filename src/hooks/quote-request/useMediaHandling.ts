
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/components/client/quotes/form-steps/types"

export function useMediaHandling(form: UseFormReturn<QuoteRequestFormData>) {
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

      const currentDetails = form.getValues(`service_details.${serviceId}`) || {}
      const currentImages = currentDetails.images || []
      
      form.setValue(`service_details.${serviceId}`, {
        ...currentDetails,
        images: [...currentImages, ...newUrls]
      })

      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (url: string, serviceId: string) => {
    try {
      const urlPath = url.split('/').pop()
      if (!urlPath) return

      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([urlPath])

      if (deleteError) throw deleteError

      const currentDetails = form.getValues(`service_details.${serviceId}`)
      const currentImages = currentDetails?.images || []
      
      form.setValue(`service_details.${serviceId}`, {
        ...currentDetails,
        images: currentImages.filter((image: string) => image !== url)
      })

      toast.success('Image removed successfully')
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message)
    }
  }

  return {
    uploading,
    handleImageUpload,
    handleImageRemove
  }
}
