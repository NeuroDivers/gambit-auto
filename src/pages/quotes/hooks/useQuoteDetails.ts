
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function useQuoteDetails(id: string | undefined) {
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const { data: quoteRequest, isLoading, refetch } = useQuery({
    queryKey: ["quoteRequest", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          *,
          client:client_id (
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .eq("id", id)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  const createWorkOrderMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('convert_quote_to_work_order', {
        input_quote_id: id
      })
      if (error) throw error
      return data
    },
    onSuccess: (workOrderId) => {
      toast.success("Quote converted to work order successfully")
      navigate(`/work-orders/${workOrderId}`)
    },
    onError: (error) => {
      console.error('Error converting to work order:', error)
      toast.error("Failed to convert quote to work order")
    }
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('create_new_invoice', {
        p_customer_first_name: quoteRequest?.client?.first_name,
        p_customer_last_name: quoteRequest?.client?.last_name,
        p_customer_email: quoteRequest?.client?.email,
        p_customer_phone: quoteRequest?.client?.phone_number,
        p_vehicle_make: quoteRequest?.vehicle_make,
        p_vehicle_model: quoteRequest?.vehicle_model,
        p_vehicle_year: quoteRequest?.vehicle_year,
        p_vehicle_vin: quoteRequest?.vehicle_vin,
        p_status: 'draft'
      })
      if (error) throw error
      return data
    },
    onSuccess: (invoiceId) => {
      toast.success("Draft invoice created successfully")
      navigate(`/invoices/${invoiceId}`)
    },
    onError: (error) => {
      console.error('Error creating invoice:', error)
      toast.error("Failed to create draft invoice")
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
        const { data: { publicUrl } } = supabase.storage
          .from('quote-request-media')
          .getPublicUrl(filePath)
          
        newUrls.push(publicUrl)
      }

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ media_urls: [...currentUrls, ...newUrls] })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`)
      refetch()
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (urlToRemove: string) => {
    try {
      if (!quoteRequest || !quoteRequest.media_urls) return

      const fileName = urlToRemove.split('/').pop()
      
      if (!fileName) return

      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([fileName])

      if (deleteError) throw deleteError

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({
          media_urls: quoteRequest.media_urls.filter(url => url !== urlToRemove)
        })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success('Image removed successfully')
      refetch()
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message)
    }
  }

  return {
    quoteRequest,
    isLoading,
    uploading,
    handleFileUpload,
    handleImageRemove,
    createWorkOrder: () => createWorkOrderMutation.mutate(),
    createInvoice: () => createInvoiceMutation.mutate(),
    isCreatingWorkOrder: createWorkOrderMutation.isPending,
    isCreatingInvoice: createInvoiceMutation.isPending
  }
}
