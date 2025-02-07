
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type QuoteRequest = {
  id: string
  status: "pending" | "approved" | "rejected"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  description: string
  created_at: string
}

export default function QuoteRequests() {
  const { data: quoteRequests, isLoading } = useQuery({
    queryKey: ["quoteRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Quote Requests</h1>
      <div className="grid gap-4">
        {quoteRequests?.map((request) => (
          <Card key={request.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
              </CardTitle>
              <Badge 
                variant={
                  request.status === "approved" 
                    ? "success" 
                    : request.status === "rejected" 
                    ? "destructive" 
                    : "default"
                }
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{request.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                VIN: {request.vehicle_vin}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted: {new Date(request.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
        {quoteRequests?.length === 0 && (
          <p className="text-center text-muted-foreground">No quote requests found.</p>
        )}
      </div>
    </div>
  )
}
