
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, quoteId: string) => {
    try {
      setUploading(true)
      const files = event.target.files
      if (!files || files.length === 0) return

      // Get the current quote request to check its media_urls
      const { data: currentQuote, error: fetchError } = await supabase
        .from('quote_requests')
        .select('media_urls')
        .eq('id', quoteId)
        .single()

      if (fetchError) throw fetchError

      const existingUrls = currentQuote?.media_urls || []
      const newUrls: string[] = []

      // Check quote request status
      const { data: quoteRequest } = await supabase
        .from('quote_requests')
        .select('status')
        .eq('id', quoteId)
        .single()

      if (!quoteRequest || !['pending', 'estimated'].includes(quoteRequest.status)) {
        toast.error('Cannot add images in the current status')
        return
      }

      // Upload each file
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${quoteId}-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('quote-request-media')
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }

      // Update quote request with new URLs
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ 
          media_urls: [...existingUrls, ...newUrls]
        })
        .eq('id', quoteId)

      if (updateError) throw updateError

      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (quoteId: string, urlToRemove: string, currentUrls: string[]) => {
    try {
      const { data: quoteRequest } = await supabase
        .from('quote_requests')
        .select('status')
        .eq('id', quoteId)
        .single()

      if (!quoteRequest || !['pending', 'estimated'].includes(quoteRequest.status)) {
        toast.error('Cannot modify images in the current status')
        return
      }

      // Extract the file path from the public URL
      const filePath = urlToRemove.split('/').pop()
      if (!filePath) {
        throw new Error('Invalid file path')
      }

      // Remove file from storage
      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([filePath])

      if (deleteError) throw deleteError

      // Update quote request to remove URL from array
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          media_urls: currentUrls.filter(url => url !== urlToRemove)
        })
        .eq('id', quoteId)

      if (updateError) throw updateError

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

