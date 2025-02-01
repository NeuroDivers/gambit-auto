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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QuoteRequest } from "./types"

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

export function QuoteRequestCard({ request }: { request: QuoteRequest }) {
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
    <Card className="transition-all duration-200 hover:shadow-lg hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {request.first_name} {request.last_name}
              <Badge variant="outline" className="text-xs font-normal">
                {format(new Date(request.created_at), "MMM d, yyyy")}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm">
              {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <EditQuoteDialog quote={request} />
            <Select
              defaultValue={request.status}
              onValueChange={updateStatus}
            >
              <SelectTrigger className={`w-[130px] ${getStatusStyles(request.status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Services:</span>
                <p className="font-medium">
                  {request.quote_request_services
                    .map(service => service.service_types.name)
                    .join(", ")}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>
                <p className="font-medium">
                  {request.contact_preference === "email" ? request.email : request.phone_number}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Serial Number:</span>
                <p className="font-medium">{request.vehicle_serial}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <p className="font-medium">${request.price?.toFixed(2) ?? '0.00'}</p>
              </div>
            </div>
          </div>

          {request.additional_notes && (
            <div className="pt-2 border-t border-border/40">
              <span className="text-sm text-muted-foreground">Notes:</span>
              <p className="mt-1 text-sm">{request.additional_notes}</p>
            </div>
          )}

          {request.status === "pending" && (
            <div className="flex gap-2 justify-end pt-2 border-t border-border/40">
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
            <div className="flex justify-end pt-2 border-t border-border/40">
              <Button
                size="sm"
                onClick={() => setIsWorkOrderDialogOpen(true)}
              >
                Convert to Work Order
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CreateWorkOrderDialog
        open={isWorkOrderDialogOpen}
        onOpenChange={setIsWorkOrderDialogOpen}
        quoteRequest={request}
      />
    </Card>
  )
}