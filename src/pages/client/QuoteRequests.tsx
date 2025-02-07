
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type QuoteRequest = {
  id: string
  status: "pending" | "estimated" | "accepted" | "rejected" | "converted"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  description: string
  created_at: string
  estimated_amount: number | null
  client_response: "accepted" | "rejected" | null
}

export default function QuoteRequests() {
  const queryClient = useQueryClient()

  const { data: quoteRequests, isLoading } = useQuery({
    queryKey: ["quoteRequests"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("client_id", user.user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
  })

  const handleResponseMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string, response: "accepted" | "rejected" }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ 
          client_response: response,
          status: response === "accepted" ? "accepted" : "rejected"
        })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
      toast.success("Response submitted successfully")
    },
    onError: (error) => {
      toast.error("Failed to submit response: " + error.message)
    }
  })

  const getStatusBadgeVariant = (status: QuoteRequest['status']) => {
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
          <Card key={request.id} className={cn(
            "transition-colors",
            request.status === "estimated" && !request.client_response && "border-primary"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {request.vehicle_make} {request.vehicle_model} ({request.vehicle_year})
              </CardTitle>
              <Badge variant={getStatusBadgeVariant(request.status)}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{request.description}</p>
              
              {request.estimated_amount !== null && (
                <p className="mt-2 text-lg font-semibold">
                  Estimated Cost: ${request.estimated_amount.toFixed(2)}
                </p>
              )}

              {request.status === "estimated" && !request.client_response && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="default"
                    onClick={() => handleResponseMutation.mutate({ 
                      id: request.id, 
                      response: "accepted" 
                    })}
                  >
                    Accept Estimate
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleResponseMutation.mutate({ 
                      id: request.id, 
                      response: "rejected" 
                    })}
                  >
                    Reject Estimate
                  </Button>
                </div>
              )}

              <div className="mt-2 text-xs text-muted-foreground">
                <p>VIN: {request.vehicle_vin}</p>
                <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
              </div>
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

