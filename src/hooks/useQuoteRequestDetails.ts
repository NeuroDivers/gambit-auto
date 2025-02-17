
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import type { QuoteRequest } from "@/types/quote-request"

export function useQuoteRequestDetails() {
  const { id } = useParams()
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

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

  const { data: quoteRequest, isLoading } = useQuery({
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

  // Set up real-time subscription
  useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel('quote-request-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests',
          filter: `id=eq.${id}`
        },
        () => {
          // Invalidate and refetch the quote request data
          queryClient.invalidateQueries({ queryKey: ["quoteRequest", id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, queryClient])

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
      if (!quoteRequest || !quoteRequest.media_urls) return

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([filePath])

      if (deleteError) throw deleteError

      // Update the media_urls array
      const updatedUrls = quoteRequest.media_urls.filter(url => url !== filePath)

      // Update the quote request
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          media_urls: updatedUrls
        })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success('Image removed successfully')
    } catch (error: any) {
      console.error('Error removing image:', error)
      toast.error('Error removing image: ' + error.message)
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
    handleFileUpload,
    handleImageRemove,
    getServiceName
  }
}
