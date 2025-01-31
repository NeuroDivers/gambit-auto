import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequestCard } from "./QuoteRequestCard"
import { useEffect, useMemo } from "react"
import { StatusLegend } from "./StatusLegend"
import { LoadingState } from "./LoadingState"
import { WorkOrderCalendar } from "../work-orders/WorkOrderCalendar"

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
    return <LoadingState />
  }

  return (
    <div className="space-y-20">
      <section className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Work Orders Calendar</h3>
          <WorkOrderCalendar />
        </div>
      </section>
      
      <section className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Quote Requests</h3>
          <StatusLegend statusCounts={statusCounts} />
          {requests?.map((request) => (
            <QuoteRequestCard key={request.id} request={request} />
          ))}
          {requests?.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No quote requests yet
            </div>
          )}
        </div>
      </section>
    </div>
  )
}