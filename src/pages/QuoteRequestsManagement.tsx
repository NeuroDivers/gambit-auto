
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export default function QuoteRequestsManagement() {
  const queryClient = useQueryClient()
  const [estimateAmount, setEstimateAmount] = useState<{ [key: string]: string }>({})

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

  const submitEstimateMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ 
          estimated_amount: amount,
          status: "estimated"
        })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuoteRequests"] })
      toast.success("Estimate submitted successfully")
    },
    onError: (error) => {
      toast.error("Failed to submit estimate: " + error.message)
    }
  })

  const getStatusBadgeVariant = (status: QuoteRequest['status']) => {
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

  const handleEstimateSubmit = (id: string) => {
    const amount = parseFloat(estimateAmount[id])
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    submitEstimateMutation.mutate({ id, amount })
    setEstimateAmount(prev => ({ ...prev, [id]: "" }))
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
      <div className="grid gap-4">
        {quoteRequests?.map((request) => (
          <Card key={request.id} className={cn(
            "transition-colors",
            request.status === "accepted" && !request.client_response && "border-primary"
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

              {request.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Input
                    type="number"
                    placeholder="Enter estimate amount"
                    value={estimateAmount[request.id] || ""}
                    onChange={(e) => setEstimateAmount(prev => ({
                      ...prev,
                      [request.id]: e.target.value
                    }))}
                    className="max-w-[200px]"
                  />
                  <Button 
                    variant="default"
                    onClick={() => handleEstimateSubmit(request.id)}
                  >
                    Submit Estimate
                  </Button>
                </div>
              )}

              <div className="mt-2 text-xs text-muted-foreground">
                <p>VIN: {request.vehicle_vin}</p>
                <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                {request.client_response && (
                  <p className="mt-1">
                    Client response: <span className="font-semibold">{request.client_response}</span>
                  </p>
                )}
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
