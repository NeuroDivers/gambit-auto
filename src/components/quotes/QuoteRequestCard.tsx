import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { EditQuoteDialog } from "./EditQuoteDialog"
import { useState } from "react"
import { CreateWorkOrderDialog } from "../work-orders/CreateWorkOrderDialog"

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

type QuoteRequestCardProps = {
  request: QuoteRequest
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending":
      return "text-[rgb(250,204,21)] bg-[rgb(234,179,8,0.2)] border-[rgb(234,179,8,0.3)]"
    case "approved":
      return "text-[#0EA5E9] bg-[rgb(14,165,233,0.2)] border-[rgb(14,165,233,0.3)]"
    case "rejected":
      return "text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]"
    case "completed":
      return "text-[#9b87f5] bg-[rgb(155,135,245,0.2)] border-[rgb(155,135,245,0.3)]"
    default:
      return ""
  }
}

export function QuoteRequestCard({ request }: QuoteRequestCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false)

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
    } catch (error: any) {
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
          <div className="flex items-center gap-2">
            <EditQuoteDialog quote={request} />
            <Badge className={`border ${getStatusStyles(request.status)}`}>
              {request.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium">Services:</span>
            <span>
              {request.quote_request_services
                .map(service => service.service_types.name)
                .join(", ")}
            </span>
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

        {request.status === "approved" && (
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setIsWorkOrderDialogOpen(true)}
            >
              Convert to Work Order
            </Button>
          </div>
        )}
      </CardContent>

      <CreateWorkOrderDialog
        open={isWorkOrderDialogOpen}
        onOpenChange={setIsWorkOrderDialogOpen}
        quoteRequest={request}
      />
    </Card>
  )
}