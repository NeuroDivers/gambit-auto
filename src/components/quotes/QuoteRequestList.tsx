import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { QuoteRequestsSection } from "./sections/QuoteRequestsSection"
import { QuoteCalendar } from "./QuoteCalendar"

export const QuoteRequestList = () => {
  const queryClient = useQueryClient()

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

  return (
    <div className="space-y-20">
      <QuoteCalendar />
      <QuoteRequestsSection />
    </div>
  )
}