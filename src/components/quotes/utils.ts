
import { supabase } from "@/integrations/supabase/client"

export const getServiceNames = (serviceIds: string[], services: any[]) => {
  if (!services) return []
  return serviceIds.map(id => 
    services.find(s => s.id === id)?.name || 'Unknown Service'
  )
}

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "default"
    case "estimated":
      return "secondary"
    case "accepted":
      return "success"
    case "rejected":
      return "destructive"
    case "converted":
      return "outline"
    default:
      return "default"
  }
}

export const getImageUrl = (mediaUrl: string | null) => {
  if (!mediaUrl) return null
  
  // If the URL already contains the storage URL, return it as is
  if (mediaUrl.startsWith('http')) {
    return mediaUrl
  }
  
  // Otherwise, get the public URL from the storage bucket
  const { data } = supabase.storage
    .from('quote-request-media')
    .getPublicUrl(mediaUrl)
  
  return data.publicUrl
}
