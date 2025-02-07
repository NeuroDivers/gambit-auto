
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

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

export default function QuoteRequestsManagement() {
  const queryClient = useQueryClient()

  const { data: quoteRequests, isLoading } = useQuery({
    queryKey: ["adminQuoteRequests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ status })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuoteRequests"] })
      toast({
        title: "Success",
        description: "Quote request status updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quote request status.",
      })
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
      <h1 className="text-2xl font-bold mb-6">Quote Requests Management</h1>
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
              {request.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: request.id, status: "approved" })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: request.id, status: "rejected" })}
                  >
                    Reject
                  </Button>
                </div>
              )}
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
