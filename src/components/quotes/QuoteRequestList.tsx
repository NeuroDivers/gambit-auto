import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequestCard } from "./QuoteRequestCard"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

type QuoteRequest = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  contact_preference: "phone" | "email"
  service_id: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_serial: string
  additional_notes?: string
  media_url?: string
  status: string
  created_at: string
  service_types: {
    name: string
  }
}

export const QuoteRequestList = () => {
  const queryClient = useQueryClient()
  
  const { data: requests, isLoading } = useQuery({
    queryKey: ["quoteRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          *,
          service_types (
            name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel("quote_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quote_requests",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests?.map((request) => (
        <QuoteRequestCard key={request.id} request={request} />
      ))}
      {requests?.length === 0 && (
        <div className="text-center py-8 text-white/60">
          No quote requests yet
        </div>
      )}
    </div>
  )
}