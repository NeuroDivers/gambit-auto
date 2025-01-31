import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

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

type QuoteRequestCardProps = {
  request: QuoteRequest
}

export function QuoteRequestCard({ request }: QuoteRequestCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("quote_requests")
        .update({ status })
        .eq("id", request.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Quote request marked as ${status}`,
      })

      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {request.first_name} {request.last_name}
            </CardTitle>
            <CardDescription>
              Submitted on {format(new Date(request.created_at), "PPP")}
            </CardDescription>
          </div>
          <Badge
            variant={
              request.status === "pending"
                ? "default"
                : request.status === "approved"
                ? "success"
                : "destructive"
            }
          >
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium">Service:</span>
            <span>{request.service_types.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium">Contact:</span>
            <span>
              {request.contact_preference === "email" ? request.email : request.phone_number}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium">Vehicle:</span>
            <span>
              {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
            </span>
          </div>
          {request.additional_notes && (
            <div className="col-span-2 mt-2">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-white/60">{request.additional_notes}</p>
            </div>
          )}
        </div>

        {request.status === "pending" && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus("rejected")}
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => updateStatus("approved")}
            >
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}