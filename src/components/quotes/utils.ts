import { supabase } from "@/integrations/supabase/client"

export const getServiceNames = (serviceIds: string[], services: any[]) => {
  if (!services) return []
  return serviceIds.map(id => 
    services.find(s => s.id === id)?.name || 'Unknown Service'
  )
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

export const getStatusBadgeVariant = (status: "pending" | "estimated" | "accepted" | "rejected" | "converted") => {
  switch (status) {
    case "pending":
      return "default"
    case "estimated":
      return "secondary"
    case "accepted":
      return "secondary"
    case "rejected":
      return "destructive"
    case "converted":
      return "outline"
    default:
      return "default"
  }
}
