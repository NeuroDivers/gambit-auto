
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import type { QuoteRequest } from "@/types/quote-request"

export function useQuoteRequestDetails() {
  const { id } = useParams()
  const [uploading, setUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
      if (error) throw error
      return data
    }
  })

  const { data: quoteRequest, isLoading, refetch } = useQuery({
    queryKey: ["quoteRequest", id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          *,
          client:clients(*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    }
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return

      setUploading(true)
      const files = Array.from(event.target.files)
      const currentUrls = quoteRequest?.media_urls || []
      const newUrls: string[] = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError
        newUrls.push(filePath)
      }

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ media_urls: [...currentUrls, ...newUrls] })
        .eq('id', id)

      if (updateError) throw updateError

      await refetch()
      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (filePath: string) => {
    try {
      if (!quoteRequest) return

      console.log('Current media_urls:', quoteRequest.media_urls)
      console.log('Attempting to delete file:', filePath)
      
      // First, delete from storage
      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([filePath])

      if (deleteError) {
        console.error('Storage delete error:', deleteError)
        throw deleteError
      }

      console.log('File deleted from storage successfully')

      // Then update the media_urls array
      const updatedUrls = (quoteRequest.media_urls || []).filter(url => url !== filePath)
      console.log('Updated media_urls:', updatedUrls)

      // Update the quote request
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          media_urls: updatedUrls
        })
        .eq('id', id)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw updateError
      }

      console.log('Database updated successfully')
      await refetch()
      toast.success('Image removed successfully')
    } catch (error: any) {
      console.error('Error removing image:', error)
      toast.error('Error removing image: ' + error.message)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('quote_requests')
        .update({
          media_urls: quoteRequest?.media_urls || []
        })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Changes saved successfully')
      return true
    } catch (error: any) {
      toast.error('Error saving changes: ' + error.message)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const getServiceName = (serviceId: string) => {
    const service = services?.find(s => s.id === serviceId)
    return service ? service.name : "Unknown Service"
  }

  return {
    quoteRequest,
    isLoading,
    uploading,
    isSaving,
    handleFileUpload,
    handleImageRemove,
    handleSave,
    getServiceName
  }
}
