import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequestCard } from "./QuoteRequestCard"
import { useEffect, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type QuoteRequest = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  contact_preference: "phone" | "email"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_serial: string
  additional_notes?: string
  media_url?: string
  status: string
  created_at: string
  quote_request_services: {
    service_types: {
      name: string
    }
  }[]
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
          quote_request_services (
            service_types (
              name
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
  })

  const statusCounts = useMemo(() => {
    if (!requests) return { pending: 0, approved: 0, rejected: 0, completed: 0 }
    return requests.reduce((acc, request) => {
      acc[request.status as keyof typeof acc] = (acc[request.status as keyof typeof acc] || 0) + 1
      return acc
    }, { pending: 0, approved: 0, rejected: 0, completed: 0 })
  }, [requests])

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
      <div className="flex flex-wrap gap-2 items-center mb-4 p-4 bg-card rounded-lg">
        <span className="text-sm font-medium mr-2">Status Legend:</span>
        <Badge className="border text-[rgb(250,204,21)] bg-[rgb(234,179,8,0.2)] border-[rgb(234,179,8,0.3)]">
          pending ({statusCounts.pending})
        </Badge>
        <span className="text-sm text-muted-foreground">awaiting review</span>
        <Badge className="border text-[#0EA5E9] bg-[rgb(14,165,233,0.2)] border-[rgb(14,165,233,0.3)]">
          approved ({statusCounts.approved})
        </Badge>
        <span className="text-sm text-muted-foreground">quote accepted</span>
        <Badge className="border text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]">
          rejected ({statusCounts.rejected})
        </Badge>
        <span className="text-sm text-muted-foreground">quote declined</span>
        <Badge className="border text-[#9b87f5] bg-[rgb(155,135,245,0.2)] border-[rgb(155,135,245,0.3)]">
          completed ({statusCounts.completed})
        </Badge>
        <span className="text-sm text-muted-foreground">service finished</span>
      </div>
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